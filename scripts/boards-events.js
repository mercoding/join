/*
    Author: Martin Reifschneider
*/
import { closeContactSelectBox, parseTaskIdToNumberId, toggleContactListToFalse } from './boards-edit.js';
import { refresh } from './boards.js';
import { openOverlay, overlayIsOpen } from './boards-overlay.js';
let originalColumn = null;
let currentColumn = null;
const taskContainer = document.getElementById("board-main");
const dropzones = document.querySelectorAll(".column");
const movableDiv = document.getElementById("dragelement");
let currentTaskId = null;
let offsetX, offsetY;
let isDragging = false; // Flag to track if the element is being dragged
let startX, startY, endX, endY, tapTimeout; // Start position for dragging
const tapThreshold = 10;
const swipeThresholdX = 30;   // Schwellenwert für horizontales Swiping
const swipeThresholdY = 30;
let dragTimeout;
let quickTap = false;


/**
 * Template for movable object there copied all tasks information to it for simulating
 * task card drag and drop
 *
 * @param {*} id
 * @param {*} index
 * @returns {string}
 */
function getTaskBody(id, index) {
    return /*html*/`
        <section class="task-card add-task-card${index} clickable prevent-select"></section>
    `;
}

/**
 * Compare column id's from board.html and get column name back
 * for task array literal
 *
 * @param {*} key
 * @returns {string}
 */
function getColumn(key) {
    let column = "";
    switch (key) {
        case 'to-do': column = "To Do"; break;
        case 'in-progress': column = "In Progress"; break;
        case 'await-feedback': column = "Await Feedback"; break;
        case 'done': column = "Done"; break;
    }
    return column;
}


/**
 * Preparing movable object with all informations of catched div from mouse or touch event
 *
 * @param {*} taskElement
 */
function prepareMovableObject(taskElement) {
    if (!isDragging) return;
    currentTaskId = taskElement.getAttribute("id");
    originalColumn = taskElement.closest(".column");
    originalColumn.style.backgroundColor = "lightgrey";
    let index = parseTaskIdToNumberId(currentTaskId);
    movableDiv.innerHTML = getTaskBody(currentTaskId, index);
    movableDiv.querySelector('section').innerHTML = document.getElementById(currentTaskId).innerHTML;
    movableDiv.querySelector('section').style.transition = "0.1s ease";
    movableDiv.querySelector('section').style.transform = "rotate(5deg)";
    movableDiv.style.display = "block";
}

/** Reset movable object */
function resetMovableObject() {
    if (movableDiv == null) return;
    movableDiv.querySelector('section').style.transition = "0.1s ease";
    movableDiv.querySelector('section').style.transform = "rotate(0deg)";
    movableDiv.style.display = "none";
    document.getElementById(currentTaskId).classList.remove('task-card-placeholder');
    currentTaskId = null;
}


/** Reset touched column background color */
function resetColumn() {
    if (originalColumn) {
        originalColumn.style.backgroundColor = "";
    }
    if (currentColumn) {
        currentColumn.style.backgroundColor = "";
    }
    // Reset
    originalColumn = null;
    currentColumn = null;
}


/**
 * Save all changed informations to task array and on firebase and refresh board data
 *
 * @param {*} currentTaskId
 * @param {*} columnId
 */
function saveMovedTask(currentTaskId, columnId) {
    let id = parseTaskIdToNumberId(currentTaskId);
    tasksFromFirebase[id].Column = getColumn(columnId);
    putData(TASKS_DIR, tasksFromFirebase);
    refresh();
}


/**
 * Change touched column color to lightgreen
 *
 * @param {*} newColumn
 */
function colorTouchedColumn(newColumn) {
    if (newColumn !== currentColumn) {
        if (currentColumn && currentColumn !== originalColumn) {
            currentColumn.style.backgroundColor = "";
        }
        if (newColumn && newColumn !== originalColumn) {
            newColumn.style.backgroundColor = "lightgreen";
        }
        currentColumn = newColumn;
    }
}


/**
 * Check if mouse bounding column rectangle
 *
 * @param {*} event
 * @param {*} column
 * @returns {boolean}
 */
function checkMousemoveBounding(event, column) {
    const rect = column.getBoundingClientRect();
    return (
        event.clientX > rect.left &&
        event.clientX < rect.right &&
        event.clientY > rect.top &&
        event.clientY < rect.bottom
    );
}


/**
 * Check if end position on mouseup or touchend bounding column rectangle
 * to example if you move from column called "To Do" to "Done"
 *
 * @param {*} dropzone
 * @returns {boolean}
 */
function checkDropzoneBounding(dropzone) {
    const movableRect = movableDiv.getBoundingClientRect();
    const dropzoneRect = dropzone.getBoundingClientRect();
    return (
        movableRect.left < dropzoneRect.right &&
        movableRect.right > dropzoneRect.left &&
        movableRect.top < dropzoneRect.bottom &&
        movableRect.bottom > dropzoneRect.top
    );
}


/**
 * Function for waiting 200ms and preparing dragging element
 *
 * @param {*} isTouch
 * @param {*} event
 * @param {*} taskElement
 */
function waitForDrag(isTouch, event, taskElement) {
    // Set timout for dragging
    dragTimeout = setTimeout(() => {
        isDragging = true;
        quickTap = false;
        prepareMovableObject(taskElement);
        const rect = taskElement.getBoundingClientRect();
        offsetX = startX - rect.left;
        offsetY = startY - rect.top;
        movableDiv.style.left = (isTouch ? event.touches[0].pageX : event.pageX) - offsetX + "px";
        movableDiv.style.top = (isTouch ? event.touches[0].pageY : event.pageY) - offsetY + "px";
        document.getElementById(currentTaskId).classList.add('task-card-placeholder');
    }, 500);
}

// Function to handle start event for mouse or touch
function handleStart(event, isTouch = false) {
    event.preventDefault();
    const taskElement = event.target.closest(".task-card");
    const button = event.target.closest(".add-btn");
    if(button) event.target.click();
    if (taskElement) {
        currentTaskId = taskElement.id;
        quickTap = true;
        startX = isTouch ? event.touches[0].clientX : event.clientX;
        startY = isTouch ? event.touches[0].clientY : event.clientY;
        endX = isTouch ? event.touches[0].clientX : event.clientX;
        endY = isTouch ? event.touches[0].clientY : event.clientY;
        tapTimeout = setTimeout(() => { quickTap = false; }, 150);
        waitForDrag(isTouch, event, taskElement);
    }
}


// Function to handle mouse or touch move
function handleMove(event, isTouch = false) {
    if (!currentTaskId || !isDragging) return;

    movableDiv.style.left = (isTouch ? event.touches[0].pageX : event.pageX) - offsetX + "px";
    movableDiv.style.top = (isTouch ? event.touches[0].pageY : event.pageY) - offsetY + "px";

    let newColumn = null;
    dropzones.forEach(column => {
        if (isTouch ? checkDropzoneBounding(column) : checkMousemoveBounding(event, column)) newColumn = column;
    });
    setZoom(0.35, false);
    colorTouchedColumn(newColumn);
    event.preventDefault();
}


/**
 * Function for scroll on touch event
 *
 * @param {*} deltaX
 * @param {*} deltaY
 */
function onScroll(event, deltaX, deltaY) {
    const taskElement = event.target.closest(".task-card");
    if (taskElement) {
        if (!quickTap && deltaX > swipeThresholdX && deltaX > deltaY) {
            const column = event.target.closest('.column');
            if (column == null) return;
            if (endX < startX) column.scrollLeft += 252;
            else column.scrollLeft -= 252;
        }
        else if (!quickTap && deltaY > swipeThresholdY && deltaY > deltaX) {
            const mainContainer = document.querySelector('main');
            if (endY < startY) mainContainer.scrollTop += 300;  // Scrollen um 100px nach unten
            else mainContainer.scrollTop -= 300;  // Scrollen um 100px nach oben
        }
    }
}

/**
 * Function for swipe on touch event
 *
 * @param {*} event
 */
function handleSwipe(event) {
    endX = event.changedTouches[0].clientX;
    endY = event.changedTouches[0].clientY;
    const deltaX = Math.abs(endX - startX);
    const deltaY = Math.abs(endY - startY);
    if (deltaX < tapThreshold && deltaY < tapThreshold && quickTap) {
        const taskElement = event.target.closest(".task-card");
        if (taskElement) handleClickOnTask(taskElement.getAttribute("id"));
    }
    else if (!quickTap) onScroll(event, deltaX, deltaY);
}


/** Clear all set timeout */
function clearTimeouts() {
    clearTimeout(dragTimeout);
    clearTimeout(tapTimeout);
}

/**
 * Function for swapping tasks
 *
 * @param {*} dropzone
 */
function checkBoundingTask(dropzone) {
    const targetOtherTasks = dropzone.querySelectorAll('.task-card');
    targetOtherTasks.forEach(taskDiv => {
        if (checkDropzoneBounding(taskDiv) && taskDiv.id != currentTaskId) {
            let i = parseTaskIdToNumberId(taskDiv.id), j = parseTaskIdToNumberId(currentTaskId);
            let temp = tasksFromFirebase[i].id;
            tasksFromFirebase[i].id = tasksFromFirebase[j].id;
            tasksFromFirebase[j].id = temp;
            [tasksFromFirebase[i], tasksFromFirebase[j]] = [tasksFromFirebase[j], tasksFromFirebase[i]];
            currentTaskId = "taskId" + tasksFromFirebase[i].id;
        }
    });
}

/**
 * Function to handle end event for mouse and touch
 *
 * @param {boolean} [isTouch=false]
 */
function handleEnd(event, isTouch = false) {
    clearTimeouts();
    if (isTouch && !quickTap) handleSwipe(event);
    if (!isDragging && quickTap) handleClickOnTask(currentTaskId);
    else if (isDragging && currentTaskId) {
        dropzones.forEach(dropzone => {
            const columnId = dropzone.getAttribute("id");
            if (checkDropzoneBounding(dropzone)) {
                checkBoundingTask(dropzone);
                saveMovedTask(currentTaskId, columnId);
            }
        });
        resetMovableObject();
        resetColumn();
        setZoom(1.0, true);
    }
    isDragging = false;
    quickTap = false;
}

/**
 * Function for zoom out on smartphones
 *
 * @param {*} scale
 */
export function setZoom(scale, reset) {
    if (window.innerWidth > 768 && !reset) return;
    if (reset && scale < 1.0) document.querySelector('main').scrollTop = 0;
    const viewport = document.querySelector("meta[name=viewport]");
    viewport.setAttribute("content", `width=device-width, initial-scale=${scale}, maximum-scale=${scale}`);
}

// Event Listener for board
export function addBoardListener(aktive) {
    if (taskContainer != null) taskContainer.addEventListener("mousedown", function (event) { if (!overlayIsOpen) handleStart(event); });
    if (taskContainer != null) taskContainer.addEventListener("touchstart", function (event) { if (!overlayIsOpen) handleStart(event, true); }, { passive: false });
    document.addEventListener("mouseup", function (event) { if (!overlayIsOpen) handleEnd(event); });
    document.addEventListener("touchend", function (event) { if (!overlayIsOpen) handleEnd(event, true); }, { passive: false });
    document.addEventListener("mousemove", function (event) { if (!overlayIsOpen) handleMove(event); });
    document.addEventListener("touchmove", function (event) { if (!overlayIsOpen) handleMove(event, true); }, { passive: false });
}

/**
 * Function to add listener for card editing
 *
 * @export
 * @param {*} assign
 * @param {*} taskId
 */
export function addBoardEditListener(assign, taskId) {  
    if(assign == null) return;
    if(assign != null) document.addEventListener("click", (event) => { 
        if(event.target.closest('.assign-to-select-box')) return;
        if (!event.target.closest('.task-user-select')) {
            toggleContactListToFalse();            
            closeContactSelectBox(taskId);
            closeContactSelectBox(taskId);
        }
        
        if (!event.target.closest('.subtasks-add-box')) {   
            cancelSubtask();
        }
    });
}


/** 
 * Handle a simple click on a task
 * Add your click handling logic here
 * @param {*} taskId 
 */
function handleClickOnTask(taskId) {
    isDragging = false;
    quickTap = true;
    let id = parseTaskIdToNumberId(taskId);
    openOverlay(id);
}