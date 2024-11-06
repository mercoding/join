/*
    Author: Martin Reifschneider
*/


import { trashSVG, editSVG, getCloseSVG } from "./svg-template.js";


/**
 * Template to show task card in detail
 *
 * @export
 * @param {*} taskId
 * @returns {string}
 */
export function getDetailedCard(taskId) {
    return /*html*/`
        <section id="indetail-${taskId}" class="detailed-card grid-rows-auto">
            <div class="detailed-card-top">
                <div class="flex justify-content-center align-items-center add-task-card-category"></div>
                <div onclick="closeOverlay('.detailed-card')"class="flex justify-content-center align-items-center detailed-card-close clickable">${getCloseSVG()}</div>
            </div>
            <div class="detailed-card-container grid grid-auto-rows gap-8px auto-overflow-y mg-right-8px">

            <div class="add-task-card-headline"></div>
            <div class="add-task-card-description mg-top-16px"></div>
            <div class="add-task-card-date mg-top-16px"></div>
            <div class="add-task-card-priority flex align-items-center justify-content-flex-start mg-top-16px set-height-64px"></div>
            <div class="mg-top-16px">
                Assigned to:
                <div class="add-task-card-assigned-to">
                    <div class="add-task-card-persons grid align-items-center grid-rows-auto gap-8px mg-top-8px"></div>
                </div>
            </div>
            <div class="mg-top-16px">
                Subtasks
                <div class="detailed-task-card-subtasks add-task-card-subtasks mg-top-8px"></div>
            </div>
            </div>
            <div class="add-task-card-bottom flex justify-content-flex-end align-items-center">
                <div onclick="deleteTask('${taskId}')" class="add-task-delete mg-right-left-8px p-top-4px clickable">${trashSVG()}</div><span onclick="deleteTask('${taskId}')" class="mg-right-8px clickable">Delete</span>
                <div onclick="editTask('${taskId}')" class="add-task-edit mg-right-left-8px p-top-4px clickable">${editSVG()}</div><span onclick="editTask('${taskId}')" class="clickable">Edit</span>
            </div>
        </section>  
    `;
}


export function getAddTaskToOverlay() {
    return /*html*/`
        <section class="add-new-task-to-column grid-rows-auto">
            <div class="add-new-task-to-column-top">
                <div class="flex justify-content-center align-items-center"></div>
                <div onclick="closeOverlay('.add-new-task-to-column')"class="flex justify-content-center align-items-center detailed-card-close clickable">${getCloseSVG()}</div>
            </div>  
            <div class="add-new-task-to-column-container grid grid-auto-rows gap-8px mg-right-8px">
            
            </div>
            <div class="add-new-task-to-column-bottom flex justify-content-flex-end align-items-center">
            </div>
        </section>  
    `;
}