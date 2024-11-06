/*
    Author: Martin Reifschneider
*/


import { getPriority } from "./add-task.js";
import { parseTaskIdToNumberId, setDetailedEditableCard } from "./boards-edit.js";
import { refresh, setBgColor, setUserInitial, showData } from "./boards.js";
import { checkedBoxSVG, uncheckedBoxSVG } from "./svg-template.js";
import { getDetailedEditableCard } from "./boards-edit-template.js";
import { getDetailedCard } from "./boards-overlay-template.js";
import { addBoardEditListener, setZoom } from "./boards-events.js";
import { addListener } from "./add-task-parts.js";
export let overlayIsOpen = false;

/** Set transparency background color on overlay */
export function setOpacity() {
    document.querySelector('.overlay').classList.add('trans-dark-bg-p-50');
}


/** Unset transparency background color on overlay */
export function unsetOpacity() {
    document.querySelector('.overlay').classList.remove('trans-dark-bg-p-50');
}


/**
 * Function to set date format
 *
 * @param {*} card
 * @param {*} id
 */
function setDate(card, id) {
    const date = new Date(tasksFromFirebase[id].Date);    
    const formatter = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });    
    const formattedDate = formatter.format(date);
    card.querySelector('.add-task-card-date').innerHTML = "Due date: " + formattedDate;
}


/**
 * Function to display overlay
 *
 * @returns {*}
 */
export function getOverlay() {
    let overlay = document.querySelector('.overlay');
    overlay.classList.remove('d_none');
    overlay.classList.remove('z-index-minus-1');
    overlay.classList.add('z-index-2000');
    return overlay;
}


/**
 * Function for check and uncheck subtasks on overlayed task card
 *
 * @param {*} taskId
 * @param {*} index
 */
function checkDone(taskId, index) {
    let id = parseTaskIdToNumberId(taskId);
    tasksFromFirebase[id].Subtasks[index].Done = !tasksFromFirebase[id].Subtasks[index].Done;
    putData(TASKS_DIR, tasksFromFirebase);
    document.querySelector('.overlay').innerHTML = getDetailedCard('taskId' + id);
    setDetailedCard(id);
}


/**
 * Function for displaying checked or unchecked subtasks on overlayed task card
 *
 * @param {*} detailedCard
 * @param {*} id
 */
function setSubtasks(detailedCard, id) {
    if(tasksFromFirebase[id].Subtasks == null) return;
    tasksFromFirebase[id].Subtasks.forEach((element, index) => {
        if(element !== "") { 
            if(element.Done == true) detailedCard.querySelector('.add-task-card-subtasks').innerHTML += /*html*/`
                <div onclick="checkDone('taskId${id}', ${index})" class="grid grid-columns-2-32px-1fr align-items-center"><div class="clickable">${checkedBoxSVG()}</div><div class="flex align-items-center">${element.Description}</div></div>
            `;
            else detailedCard.querySelector('.add-task-card-subtasks').innerHTML += /*html*/`
                <div onclick="checkDone('taskId${id}', ${index})" class="grid grid-columns-2-32px-1fr align-items-center"><div class="clickable">${uncheckedBoxSVG()}</div><div class="flex align-items-center">${element.Description}</div></div>
            `;
        }
    });
}


/**
 * Function to set all task card information on overlayed task card
 *
 * @export
 * @param {*} id
 */
export function setDetailedCard(id) {
    let detailedCard = document.querySelector('.detailed-card');
    detailedCard.querySelector('.add-task-card-category').innerHTML = tasksFromFirebase[id].Category;
    setBgColor(detailedCard, tasksFromFirebase[id]);
    detailedCard.querySelector('.add-task-card-headline').innerHTML = tasksFromFirebase[id].Title;
    detailedCard.querySelector('.add-task-card-description').innerHTML = tasksFromFirebase[id].Description;
    setDate(detailedCard, id);
    detailedCard.querySelector('.add-task-card-priority').innerHTML = `<div class="mg-right-8px">Priority:</div><div class="mg-right-8px">${tasksFromFirebase[id].Priority}</div><div class="flex align-items-center">${getPriority(tasksFromFirebase[id].Priority)}</div>`;
    detailedCard.querySelector('.add-task-card-persons').innerHTML = setUserInitial(tasksFromFirebase[id], true, true);
    let userIcons = detailedCard.querySelectorAll('.circle');
    userIcons.forEach(element => { element.style.width = "42px"});
    setSubtasks(detailedCard, id);
}


/**
 * Function to call edit function for changing task card informations
 * Button edit
 *
 * @param {*} taskId
 */
function editTask(taskId) {
    let overlay = document.querySelector('.overlay');
    overlay.innerHTML = getDetailedEditableCard(taskId);
    setDetailedEditableCard(taskId);    
}


/**
 * Function for delete current displayed task card on overlay
 * Button delete
 *
 * @param {*} taskId
 */
function deleteTask(taskId) {    
    let tasks = tasksFromFirebase;
    for (let i = 0; i < tasks.length; i++) {
        let task = "taskId" + i;
        if (task === taskId) {
            tasks.splice(i, 1);
        }
    }
    tasks.forEach((element, index) => { element.id = index });
    putData(TASKS_DIR, tasks);
    closeOverlay('.detailed-card');
    if(tasks.length == 0) tasks = null;
    showData(tasks);
}


export function runInOverlayAnimation(wrapper) {
    document.querySelector(wrapper).classList.remove('runOutAnimation');
    document.querySelector(wrapper).classList.add('runInAnimation');
}


export function runOutOverlayAnimation(wrapper) {
    document.querySelector(wrapper).classList.add('runOutAnimation');
    document.querySelector(wrapper).classList.remove('runInAnimation');
    setTimeout(() => {
        let overlay = document.querySelector('.overlay');
        overlay.classList.add('d_none');
        overlay.classList.remove('z-index-2000');
        overlay.classList.add('z-index-minus-1');
        unsetOpacity();
        showData(tasksFromFirebase);
        overlayIsOpen = false;
    }, "300");
}

/**
 * Function to open overlay, which shows choosen task card in detail
 * and start animation which move card into screen
 *
 * @export
 * @param {*} id
 */
export function openOverlay(id) {
    let overlay = getOverlay();
    overlayIsOpen = true;
    overlay.innerHTML = getDetailedCard('taskId' + id);
    runInOverlayAnimation('.detailed-card');
    setDetailedCard(id);
    setOpacity();
    document.getElementById('boards-search').value = "";
    setZoom(1.0, true);
    let assign = document.querySelector('.add-task-card-assigned-to');
    addBoardEditListener(assign, 'taskId' + id);
}


/**
 * Function which close overlay whith delay because animation
 * let card move out of screen
 *
 * @export
 */
export function closeOverlay(wrapper) {
    runOutOverlayAnimation(wrapper);
    addBoardEditListener(null, '');
}


window.closeOverlay = closeOverlay;
window.deleteTask = deleteTask;
window.editTask = editTask;
window.checkDone = checkDone;