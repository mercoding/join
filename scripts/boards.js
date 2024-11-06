/*
    Author: Martin Reifschneider
*/
//import './boards-events.js';
import { addListener } from "./add-task-parts.js";
import { getInputForm } from "./add-task-template.js";
import { getPriority, setPriority } from "./add-task.js";
import { addBoardListener } from "./boards-events.js";
import { search } from "./boards-filter.js";
import { getAddTaskToOverlay } from "./boards-overlay-template.js";
import { getOverlay, openOverlay, runInOverlayAnimation, setOpacity } from "./boards-overlay.js";
import { getTaskCard, getProgressBar, getGroupUserInitials, getUser } from "./boards-template.js";
import { getPerson, loadActiveUser, loadData } from "./module.js";
let searchId = document.getElementById('boards-search');
let addToColumn = "";

/**
 * Load board and store all data for board from firebase strorage
 *
 * @async
 * @returns {*}
 */
async function loadBoards() {
    tasksFromFirebase = await loadData(TASKS_DIR);
    contactsFromFirebase = await loadData(CONTACTS_DIR);
    activeUser = await loadActiveUser(ACTIVE_DIR);
    checkIfLoggedIn();
    showData(tasksFromFirebase);
    getLogo();
    addBoardListener();
}

/**
 * Set Background Color of top row category it exists 'User Story' and 'Technical Task'
 *
 * @param {*} currentCard
 * @param {*} element
 */
export function setBgColor(currentCard, element) {
    if (element.Category === "User Story") {
        currentCard.querySelector('.add-task-card-category').classList.add('bg-color-blue');
        currentCard.querySelector('.add-task-card-category').classList.remove('bg-color-turkey');
    }
    else {
        currentCard.querySelector('.add-task-card-category').classList.remove('bg-color-blue');
        currentCard.querySelector('.add-task-card-category').classList.add('bg-color-turkey');
    }
}

/**
 * Get current color of user icon displayed in circle icon
 *
 * @param {*} firstName
 * @param {*} lastName
 * @returns {string}
 */
export function getUserColor(firstName, lastName) {
    let color = "";
    contactsFromFirebase.forEach(element => {
        if (element.firstName == firstName || element.lastName == lastName) {
            color = element.color;
        }
    });
    return color;
}


/**
 * Parse user name to initials
 *
 * @param {*} currentCard
 * @param {*} element
 */
export function setUserInitial(element, displayFullName = false, grid = false) {   
    if(element.Persons == null) return "";
    let personsHTML = "";
    element.Persons.forEach((person) => {        
        let p = getPerson(contactsFromFirebase, person);
        if(p != "") {        
            let initial = p.firstName.charAt(0) + p.lastName.charAt(0);
            let color = p.color;       
            personsHTML += getUser(person, initial, color, displayFullName, grid);
        }
    });    
    if(element.Persons.length > 4 && displayFullName == false) return setGroupUser(element, displayFullName, grid);
    return personsHTML;
}


/**
 * Function which display 3 added user and more than 3 the amount of users
 *
 * @param {*} element
 * @param {*} displayFullName
 * @param {*} grid
 * @returns {string}
 */
function setGroupUser(element, displayFullName, grid) {
    let personsHTML = "";
    for (let index = 0; index < 3; index++) {
        let p = getPerson(contactsFromFirebase, element.Persons[index]);        
        if(p != "") {        
            let initial = p.firstName.charAt(0) + p.lastName.charAt(0);
            let color = p.color;       
            personsHTML += getUser(element.Persons[index], initial, color, displayFullName, grid);
        }
    }    
    personsHTML += getGroupUserInitials(element);
    return personsHTML;
}


/**
 * Set and collect all elements for displayed card with all informations with card ctaegory, headline description to example
 *
 * @param {*} element
 * @param {*} index
 * @param {*} taskId
 */
function setCardElements(element, index) {
    let currentCard = document.querySelector(`.add-task-card${index}`);
    currentCard.querySelector('.add-task-card-category').innerHTML = element.Category;
    setBgColor(currentCard, element);
    currentCard.querySelector('.add-task-card-headline').innerHTML = element.Title;
    currentCard.querySelector('.add-task-card-description').innerHTML = element.Description.slice(0, 34) + '...';
    setSubtasks(currentCard, element);    
    currentCard.querySelector('.add-task-card-assigned-to').innerHTML = setUserInitial(element);    
    currentCard.querySelector('.add-task-card-priority').innerHTML = getPriority(element.Priority);
}


/**
 * Help function to calculate progressbar it iterate through subtask literal and add 
 * all done registered subtasks
 *
 * @export
 * @param {*} element
 * @returns {number}
 */
export function calculateDoneSubtasks(element) {
    let done = 0;
    element.Subtasks.forEach(element => { (element.Done == true) ? done+=1 : done+=0 });
    return done;
}


/**
 * Set subtasks if are exist if not then not shown
 *
 * @param {*} currentCard
 * @param {*} element
 */
function setSubtasks(currentCard, element) {
    if(element.Subtasks == null || element.Subtasks.length < 1) currentCard.querySelector('.add-task-card-subtasks').innerHTML = "";
    else currentCard.querySelector('.add-task-card-subtasks').innerHTML = getProgressBar(element);
}

/**
 * Set build task card for board - kanban board
 *
 * @param {*} element
 * @param {*} index
 * @param {*} id
 * @param {*} column
 */
export function setCard(element, index, column) {
    let taskId = 'taskId' + element.id;
    let taskTemplate = getTaskCard(element.id, taskId);    
    let className = document.querySelector(`.board-main-${column}`);
    className.innerHTML += taskTemplate;
    let card = document.querySelector('.add-task-card');
    card.classList.replace("add-task-card", `add-task-card${index}`);
    setCardElements(element, index);
}


/**
 * Function which check all colums and if it empty then display -> No tasks to do into each column
 * To Do    |   In Progress     | Await Feedback      |     Done
 *
 * @export
 */
export function checkEmptyColumns() { 
    if(!search(tasksFromFirebase, "Column", "To Do")) document.querySelector(`.board-main-to-do`).innerHTML = getEmptyColumn();
    if(!search(tasksFromFirebase, "Column", "In Progress")) document.querySelector(`.board-main-in-progress`).innerHTML = getEmptyColumn();
    if(!search(tasksFromFirebase, "Column", "Await Feedback")) document.querySelector(`.board-main-await-feedback`).innerHTML = getEmptyColumn();
    if(!search(tasksFromFirebase, "Column", "Done")) document.querySelector(`.board-main-done`).innerHTML = getEmptyColumn();
}


/** Function which clear all colums */
export function clearColumns() {
    document.querySelector(`.board-main-to-do`).innerHTML = "";
    document.querySelector(`.board-main-in-progress`).innerHTML = "";
    document.querySelector(`.board-main-await-feedback`).innerHTML = "";
    document.querySelector(`.board-main-done`).innerHTML = "";
}

/** 
 * Show all data to board it exists 4 columns 
 * To Do    |   In Progress     |   Await Feedback  |   Done
*/
export function showData(array) {
    clearColumns();  
    if(array !== null || array.length > 0) {
        array.forEach((element, index) => {   
            if (element.Column === "To Do") setCard(element, index, "to-do");
            if (element.Column === "In Progress") setCard(element, index, "in-progress");
            if (element.Column === "Await Feedback") setCard(element, index, "await-feedback");
            if (element.Column === "Done") setCard(element, index, "done");
            index++;
        });   
    }   
    checkEmptyColumns();
}


/**
 * Template which return -> No tasks to do into each column
 *
 * @returns {string}
 */
function getEmptyColumn() {
    return /*html*/`
        <section class="flex justify-content-center align-items-center emptyColumn">
            <span>No tasks To do</span>
        </section>
    `;
}


/**
 * Function which highlight column on drag over with background color
 *
 * @param {*} id
 */
function highlightColumn(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

/**
 * Function which remove highlighted column on drag leave
 *
 * @param {*} id
 */
function removeHighlightColumn(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}


/** 
 * Refresh the changed board if an element is dropped
*/
export function refresh() {
    document.querySelector('.board-main-to-do').innerHTML = "";
    document.querySelector('.board-main-in-progress').innerHTML = "";
    document.querySelector('.board-main-await-feedback').innerHTML = "";
    document.querySelector('.board-main-done').innerHTML = "";
    showData(tasksFromFirebase);
}


/** Clear all highlighted columns - optional if search highlighted */
function clearHighlightedTasks() {
    if(searchId.value == "") 
        tasksFromFirebase.forEach(element => { document.getElementById('taskId' + element.id).style.backgroundColor = 'white'; });
}


/**
 * Function which add chosen column to new task that the new task appear in it
 *
 * @param {*} column
 */
function addToChosenColumn(column) {
    switch (column) {
        case 'to-do': addToColumn = "To Do";  break;
        case 'in-progress': addToColumn = "In Progress"; break;
        case 'await-feedback': addToColumn = "Await Feedback"; break;
        case 'done': addToColumn = "Done"; break;
    }
}

/**
 * Function which show add task on overlay and add task to chosen column
 *
 * @param {*} column
 */
function openAddTaskOverlay(column) {
    addToChosenColumn(column);
    let overflow = getOverlay();
    overflow.innerHTML = getAddTaskToOverlay();
    setOpacity();
    runInOverlayAnimation('.add-new-task-to-column');
    let card = document.querySelector('.add-new-task-to-column-container');
    card.innerHTML = getInputForm();
    card.querySelector('.add-task').classList.add('add-task-to-column');
    card.querySelector('#create-task-form').setAttribute('onsubmit', `createNewTask('${addToColumn}'); return false;`);
    setPriority('medium');
    addListener();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("due-date").setAttribute("min", today);
}


window.highlightColumn = highlightColumn;
window.removeHighlightColumn = removeHighlightColumn;
window.loadBoards = loadBoards;
window.refresh = refresh;
window.openOverlay = openOverlay;
window.openAddTaskOverlay = openAddTaskOverlay;
