/*
    Author: Martin Reifschneider
*/


import { getPriority } from "./add-task.js";
import { getSubtaskMask, isChecked, getActiveUser } from "./boards-edit.js";
import { editSVG, getCloseSVG, trashSVG } from "./svg-template.js";
import { getUserColor } from "./boards.js";


/**
 * Template for user informations -> contact select box
 *
 * @export
 * @param {*} element
 * @param {*} index
 * @param {*} taskId
 * @returns {string}
 */
export function addLinkedItem(element, index, taskId) {
    let color = getUserColor(element.firstName, element.lastName);
    let selectBox = isChecked(element, taskId);
    let active = (getActiveUser(element)) ? " (you)" : "";
    return /*html*/`
        <div class="task-user-select grid grid-columns-3-48px-1fr-48px clickable" onclick="chooseContact(${index}, '${taskId}')">
            <span class="circle ${color} flex justify-content-center align-items-center set-width-height-42"><span>${element.initials}</span></span> 
            <span class="username${index} flex align-items-center">${element.firstName} ${element.lastName}${active}</span>
            <div class="flex align-items-center">${selectBox}</div>
        </div>
    `;
}

/**
 * Template for editable subtask -> with input field
 *
 * @export
 * @param {*} element
 * @param {*} taskId
 * @param {*} index
 */
export function editCardSubtask(element, taskId,index) {
    let edit = document.querySelector(`.added-subtask${index}`);
    edit.classList.remove('hide-added-subtasks-item-children');
    edit.innerHTML = /*html*/`
        <li class="p-left-8px"><input class="input-subtask" id="added-subtask-input${index}" type="text" placeholder="${element}"></li>  
        <div class="display-subtasks-mask">
            <div onclick="saveSubtaskCardEdit(${taskId},${index})" class="flex justify-content-center">
                <img class="filter-color-to-black" src="../assets/icons/check.svg" alt="">
            </div>
            <div class="divider"></div>
            <div onclick="removeCardSubtask(${taskId}, ${index})" class="flex justify-content-center">${trashSVG()}</div>
        </div>
    `;
}

/**
 * Template for editable subtask -> without input field
 *
 * @export
 * @param {*} element
 * @param {*} taskId
 * @param {*} index
 * @returns {string}
 */
export function getDisplaySubtaskMask(element, taskId, index) {
    return /*html*/`
        <div class="added-subtasks-item hide-added-subtasks-item-children added-subtask${index}">
            <li class="p-left-8px">${element.Description}</li>
            <div class="display-subtasks-mask">
                <div onclick="editCardSubtask('${element.Description}',${taskId},${index})" class="flex justify-content-center">${editSVG()}</div>
                <div class="divider"></div>
                <div onclick="removeCardSubtask(${taskId},${index})" class="flex justify-content-center">${trashSVG()}</div>
            </div>
        </div> 
    `;
}


/**
 * Template for subtask input
 *
 * @export
 * @param {*} taskId
 * @returns {string}
 */
export function getSubtaskInput(taskId) {
    return /*html*/`
        <div class="subtasks-add-box subtask-input p-right-8px">
            <div class="p-left-8px"><input id="add-new-subtask" class="add-new-subtask" type="text" placeholder="Add new task..."></div>
            <div onclick="cancelSubtask()" class="size-16px flex justify-content-center click-item clickable"><img src="../assets/icons/close.svg" alt=""></div>
            <div class="divider"></div>
            <div onclick="pushSubtask('${taskId}')" class="size-16px flex justify-content-center click-item mg-left-8px clickable"><img class="filter-color-to-black" src="../assets/icons/check.svg" alt=""></div>
        </div>
    `;
}


/**
 * Template for editable task card with all form informations
 *
 * @export
 * @param {*} taskId
 * @returns {string}
 */
export function getDetailedEditableCard(taskId) {
    return /*html*/`
        <section id="editable-${taskId}" class="detailed-card grid-rows-auto">
            <div class="detailed-card-top">
                <div></div>
                <div id="close-card-edit" onclick="cancelEdit('${taskId}')"class="flex justify-content-center align-items-center detailed-card-close">${getCloseSVG()}</div>
            </div>
            <div class="detailed-card-editable-container grid grid-auto-rows gap-8px auto-overflow-y mg-right-8px">
                <form id="task-edit-form" class="task-edit-form" onsubmit="closeEdit('${taskId}');return false;">
                    <div class="add-task-card-headline grid grid-rows-2 mg-right-8px gap-8px">
                        <span class="input-edit-label detailed-card-label">Title</span>
                        <input id="input-edit-headline" onchange="getFormData()" class="input-edit-headline input-border p-left-8px" type="text" required>
                    </div>
                    <div class="grid grid-rows-2 mg-right-8px mg-top-8px">
                        <span class="input-edit-label detailed-card-label">Description</span>
                        <textarea name="" id="textarea-edit-description" onchange="getFormData()" class="textarea-edit-description input-border mg-top-8px p-left-8px p-right-8px set-height-100px p-top-8px"></textarea>
                    </div>
                    <div class="add-task-card-date grid grid-rows-2 mg-top-8px mg-right-8px">
                        <!-- Fälligkeitsdatum -->
                        <span class="input-edit-label detailed-card-label">Due date</span>
                        <input class="due-date p-left-8px p-right-8px mg-top-8px input-border" onchange="getFormData()" type="date" id="due-date" name="due_date" required>
                    </div>
                </form>
                <div class="add-task-card-priority-edit grid grid-rows-2 gap-8px align-items-center justify-content-flex-start mg-right-8px">
                    <span class="flex detailed-card-label">Priority</span>
                    <div class="priority-buttons flex">
                    <button class="task-button grid grid-columns-2 clickable" type="button" id="urgent" data-priority="hoch" onclick="selectPriority('${taskId}', 'Urgent')">
                        <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Urgent</span>    
                        <div class="flex align-items-center set-height-100">${getPriority("Urgent")}</div>
                    </button>
                    <button class="task-button grid grid-columns-2 clickable" type="button" id="medium" data-priority="mittel" onclick="selectPriority('${taskId}', 'Medium')">
                        <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Medium</span>    
                        <div class="flex align-items-center set-height-100">${getPriority("Medium")}</div>
                    </button>
                    <button class="task-button grid grid-columns-2 clickable" type="button" id="low" data-priority="niedrig" onclick="selectPriority('${taskId}', 'Low')">
                        <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Low</span>    
                        <div class="flex align-items-center set-height-100">${getPriority("Low")}</div>
                    </button>
                </div>
            </div>
            <div class="add-task-assign-to-container grid grid-rows-2 gap-8px mg-right-8px mg-top-8px">
                <span class="detailed-card-label">Assigned to:</span>
                <div class="add-task-card-assigned-to grid grid-rows-2 gap-8px">
                    <div class="assign-to-select-box p-right-8px clickable" onclick="assignContact('${taskId}')">
                        <span class="mg-left-8px">Select contacts to assign</span>
                        <img id="assign-to-toggle-icon" class="click-item size-16px" src="../assets/icons/arrow_drop_downaa.svg" alt="">
                    </div>
                    <div class="add-task-card-persons grid grid-rows-auto auto-overflow-y set-height-128px"></div>
                </div>
            </div>
            <div class="add-new-subtask">
                <span class="detailed-card-label mg-top-8px">Subtasks</span>
                <div id='${taskId}-subtasks' class="detailed-task-card-subtasks flex">
                    ${getSubtaskMask(taskId)}
                </div>
                <div class="added-subtasks"></div>
            </div>
            </div>  
            <div class="add-task-card-bottom flex justify-content-flex-end align-items-center mg-right-8px">
                <div class="flex">
                    <button form="task-edit-form" type="submit" class="flex justify-content-center align-items-center btn-ok clickable">
                        <span class="mg-right-8px">Ok</span>
                        <img src="../assets/icons/check.svg" alt="">
                    </button>
                </div>
            </div>
        </section>  
    `;
}