/*
    Author: Martin Reifschneider
*/
import { getInputForm, getCategory, getUserIcon, getSubtaskInput, getSubtaskMask, editSubtask, getDisplaySubtaskMask, addUserItem, findPersons, getGroupInitials } from './add-task-template.js';
import { getUrgentSVG, getMediumSVG, getLowSVG} from "./svg-template.js";
import { loadActiveUser, loadData } from "./module.js";
import { addListener, validateDate } from './add-task-parts.js';
let priority = "medium";
export let toggleContactList = false, toggleCategoryList = false, toggleSubtaskButton = false;
let subtasks = [], dateValue;
export let addedUser = [];
export function toggleContacts() { toggleContactList = false; }
export function toggleCategory() { toggleCategoryList = false; }
export function toggleSubask() { toggleSubtaskButton = false; }

/**
 * Load function which load data from firebase and display add task
 * form to screen
 *
 * @async
 * @returns {*}
 */
async function loadAddTask() {
    tasksFromFirebase = await loadData(TASKS_DIR);
    contactsFromFirebase = await loadData(CONTACTS_DIR);
    activeUser = await loadActiveUser(ACTIVE_DIR);
    checkIfLoggedIn();
    document.querySelector('main').innerHTML = getInputForm();
    setBgColor('medium');
    getLogo();
    const taskForm = document.querySelector('.task-form-container');
    addListener();
    const today = new Date().toISOString().split("T")[0];
    document.getElementById("due-date").setAttribute("min", today);
}


/**
 * Function which remove unchecked user when checked box is clicked
 *
 * @param {*} data
 * @param {*} elementToRemove
 * @returns {*}
 */
function removePerson(data, elementToRemove) {
    data.forEach((item, index) => {
        if (item.email === elementToRemove) {
            data.splice(index, 1);
        }
    });
    return data;
}


/** Function which display all added user informations */
function displayAddedUser() {
    document.querySelector('.display-assigned-user').innerHTML = "";
    let index = 0;
    addedUser.forEach(element => {
        if(index < 3) document.querySelector('.display-assigned-user').innerHTML += getUserIcon(element);
        index++;
    });
    if(index > 3) document.querySelector('.display-assigned-user').innerHTML += getGroupInitials(addedUser);
}

/**
 * Function which add user into a list and call displayAddedUser for displaying
 *
 * @param {*} index
 */
function addUser(index) {    
    if (!findPersons(addedUser, contactsFromFirebase[index].email)) addedUser.push(contactsFromFirebase[index]);         
    else removePerson(addedUser, contactsFromFirebase[index].email);
    displayAddedUser();
    openContacts();
}


/**
 * Help function to compare active user to show which user is active
 *
 * @param {*} element
 * @returns {boolean}
 */
export function getActiveUser(element) {   
    if(element.email === activeUser[0].email) return true;
    return false;
}


/**
 * Function which highlight active user
 *
 * @export
 * @param {*} element
 */
export function highlightActiveUser(user, highlight) {    
    let parent =  document.querySelector(user).parentNode;
    if (highlight)  { 
        parent.classList.add('set-bg-dark-blue');
        parent.querySelector('div > svg').classList.add('filter-color-to-white');
    }
    else {
        parent.classList.remove('set-bg-dark-blue');
        parent.querySelector('div > svg').classList.remove('filter-color-to-white');
    }
}


/** Function which generate all contacts in a contact select box for adding user */
function openContacts() {
    let assignBox = document.querySelector('.assign-to-select-box > span'), persons = document.querySelector('.select-box-contacts');
    assignBox.innerHTML = "|";
+   persons.classList.add('bg-white');
    persons.classList.add('set-z-index-100');
    persons.innerHTML = "";
    contactsFromFirebase.forEach((element, index) => {
        persons.innerHTML += addUserItem(element, index);
        if(getActiveUser(element)) {
            highlightActiveUser(`.username${index}`, true);
            document.querySelector(`.username${index}`).innerHTML = `${element.firstName} ${element.lastName} (you)`;
        }
        else highlightActiveUser(`.username${index}`, false);
    });
    document.getElementById('contacts-toggle-img').style.transform = "rotate(180deg)";
}


/** Function which close contact select box */
export function closeContacts() {
    let assignBox = document.querySelector('.assign-to-select-box > span');
    if(assignBox == null) return;
    assignBox.innerHTML = "Select contacts to assign";
    let persons = document.querySelector('.select-box-contacts');
    if(persons == null) return;
    persons.classList.remove('bg-white');
    persons.classList.remove('set-z-index-100');
    persons.innerHTML = "";
    document.getElementById('contacts-toggle-img').style.transform = "rotate(0deg)";
}

/** Function which open and close contact select box */
export async function addContact() {
    contactsFromFirebase = await loadData(CONTACTS_DIR);
    toggleContactList = !toggleContactList;
    if (toggleContactList) {
        openContacts();
    }
    else {
        closeContacts();
    }
}

/**
 * Function which set user contact background color of initals circle
 *
 * @param {*} element
 */
function setBgColor(element) {
    let div = document.querySelector(`#${element}`);

    switch (element) {
        case 'urgent': div.classList.add('set-bg-red'); break;
        case 'medium': div.classList.add('set-bg-orange'); break;
        case 'low': div.classList.add('set-bg-green'); break;
    }
    div.querySelector('svg').classList.add('filter-color-to-white');

}

/**
 * Function which remove all priority button colors
 *
 * @param {*} element
 */
function removePriorityColor(element) {
    let detailedCard = document.querySelector(`${element}`);
    let buttons = detailedCard.querySelectorAll('.priority-buttons > button');

    buttons.forEach(item => {
        item.classList.remove('set-bg-red');
        item.classList.remove('set-bg-orange');
        item.classList.remove('set-bg-green');
        item.querySelector('svg').classList.remove('filter-color-to-white');
    });
}

/**
 * Function which set clicked button with current selected color
 * Urgent: red
 * Medium: orange
 * Low: green
 *
 * @export
 * @param {*} element
 * @param {*} task
 */
export function setPriorityColor(element, task) {
    removePriorityColor(element);

    switch (task.Priority) {
        case 'Urgent': setBgColor(task.Priority.toLowerCase()); break;
        case 'Medium': setBgColor(task.Priority.toLowerCase()); break;
        case 'Low': setBgColor(task.Priority.toLowerCase()); break;
    }
}

/**
 * Return current priority as SVG icon
 *
 * @export
 * @param {*} element
 * @returns {string}
 */
export function getPriority(priority) {    
    let svg = "";
    switch (priority) {
        case 'Urgent' || 'urgent': svg = getUrgentSVG(); break;
        case 'Medium' || 'medium': svg = getMediumSVG(); break;
        case 'Low' || 'low': svg = getLowSVG(); break;
    }
    return svg;
}

/**
 * Function to set priority
 *
 * @param {*} prio
 */
export function setPriority(prio) {
    priority = prio;
    removePriorityColor('.task-form-container');
    setBgColor(prio);
}

/**
 * Function to add task category
 * Categories are: User Story | Technical Task
 *
 * @param {*} cat
 */
function addCategory(cat) {
    document.querySelector('#category-input').value = cat;
    chooseCategory();
}

/** Function to open category select box and to rotate select triangle */
function openCategory() {
    let category = document.querySelector('.add-category');
    category.classList.add('bg-white');
    category.classList.add('set-z-index-100');
    category.classList.remove('d_none');
    document.getElementById('category-toggle-img').style.transform = "rotate(180deg)";
}

/** Function to close category select box and restore select triangle */
export function closeCategory() {
    let category = document.querySelector('.add-category');
    if(category == null) return;
    category.classList.remove('bg-white');
    category.classList.remove('set-z-index-100');
    category.classList.add('d_none');
    document.getElementById('category-toggle-img').style.transform = "rotate(0deg)";
}

/** Toggle help function to open or close category select box */
export function chooseCategory() {
    toggleCategoryList = !toggleCategoryList;
    let category = document.querySelector('.add-category');
    category.innerHTML = (toggleCategoryList) ? getCategory() : "";
    (toggleCategoryList) ? openCategory() : closeCategory();
}

/**
 * Function to remove added subtasks
 *
 * @param {*} index
 */
function removeSubtask(index) {
    subtasks.splice(index, 1);
    displaySubtasks();
}

/**
 * Function to save added subtasks
 *
 * @param {*} index
 */
function saveSubtaskEdit(index) {
    let subtaskInput = document.getElementById(`added-subtask-input${index}`).value;
    if(subtaskInput !== "") subtasks[index].Description = subtaskInput;
    displaySubtasks();
}

/**
 * Function to display added subtasks
 *
 * @export
 */
function displaySubtasks() {
    let subtaskDisplay = document.querySelector('.added-subtasks');
    subtaskDisplay.innerHTML = "";
    
    if(subtasks.length < 1) subtaskDisplay.innerHTML = "";
    else {
        subtasks.forEach((element, index) => {
            subtaskDisplay.innerHTML += getDisplaySubtaskMask(element, index); 
        });
    }
}

/** Function which push added subtasks into a temporary list and 
 * to show added subtasks
 */
function pushNewSubtask() {    
    let input = document.querySelector('#add-new-subtask').value;
    if(input == "" || input.trim() == "") return
    if(input !== "") {
        let subtask =  { Description: input, Done: false };    
        subtasks.push(subtask);  
        displaySubtasks('add-task', -1);        
    } 
    document.querySelector('.add-new-subtask-box').innerHTML = getSubtaskMask();    
}

/** Event listener which add new subtask when user type in and pressed enter key */
function pushNewSubtaskOnPressedEnter() {
    if(document.getElementById('add-new-subtask')) 
        document.getElementById('add-new-subtask').addEventListener("keypress", event => { if(event.key == "Enter") pushNewSubtask(); });
}

/** Toggle Function which open or close subtask input field */
export function addNewSubtask() {
    toggleSubtaskButton = !toggleSubtaskButton;
    let subtask = document.querySelector('.add-new-subtask-box');
    subtask.innerHTML = (toggleSubtaskButton) ? getSubtaskInput() : getSubtaskMask();
    pushNewSubtaskOnPressedEnter();
}

/** Clear button which clear all inputs in add task form */
function clearButton() {
    document.getElementById('title').value = "";
    document.getElementById('description').value = "";
    document.getElementById('due-date').value = "";
    document.getElementById('category-input').value = "";
    document.querySelector('.display-assigned-user').innerHTML = "";
    if(document.querySelector('.added-subtasks-item')) document.querySelector('.added-subtasks-item').innerHTML = "";
    subtasks = [];
    addedUser = [];
    setPriority("medium");
}

/**
 * Function which collect all input values into JSON format and return JSON data
 *
 * @returns {object} JSON data for task

 */
function getTaskInfos(column) {
    let persons = [];
    addedUser.forEach(element => { persons.push(element.email)});
    return {
        "id": tasksFromFirebase.length,
        "Column": column,
        "Title": document.getElementById('title').value,
        "Description": document.getElementById('description').value,
        "Date": document.getElementById('due-date').value,
        "Priority": priority.charAt(0).toUpperCase() + priority.slice(1),
        "Category": document.getElementById('category-input').value,
        "Subtasks": subtasks,
        "Persons": persons,
      };      
}

/** Function which put all data into firebase and call board */
function createNewTask(column) {          
    dateValue = document.getElementById('due-date').value;
    const d = new Date(document.getElementById('due-date').value);
    let date = document.getElementById('due-date').value = validateDate(d);
    if(date == "") {
        document.getElementById('due-date').setCustomValidity('Date is in the past!');
        document.getElementById('due-date').value = dateValue;
        return;
    }
    tasksFromFirebase.push(getTaskInfos(column));            
    putData(TASKS_DIR, tasksFromFirebase);
    setTimeout(() => { window.location = "../html/boards.html"; }, "300");
}

window.clearButton = clearButton;
window.loadAddTask = loadAddTask;
window.createNewTask = createNewTask;
window.setPriority = setPriority;
window.addContact = addContact;
window.addUser = addUser;
window.chooseCategory = chooseCategory;
window.addCategory = addCategory;
window.addNewSubtask = addNewSubtask;
window.pushNewSubtask = pushNewSubtask;
window.removeSubtask = removeSubtask;
window.editSubtask = editSubtask;
window.saveSubtaskEdit = saveSubtaskEdit;