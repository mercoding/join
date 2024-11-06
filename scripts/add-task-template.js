/*
    Author: Martin Reifschneider
*/
import { checkedBoxSVG, getCloseSVG, uncheckedBoxSVG } from './svg-template.js';
import { addedUser, getPriority } from './add-task.js';
import { editSVG, trashSVG } from './svg-template.js';



/**
 * Template for subtask without input field
 *
 * @export
 * @returns {string}
 */
export function getSubtaskMask() {
    return /*html*/`
        <div onclick="addNewSubtask()" class="subtasks-add-box p-right-8px clickable">
            <span class="mg-left-8px">Add new subtask</span>
            <img class="click-item size-16px" src="../assets/icons/subtasks_plus.svg" alt="">
        </div>
    `;
}

/**
 * Template which return user icon
 *
 * @export
 * @param {*} element
 * @returns {string}
 */
export function getUserIcon(element) {
    return /*html*/`
        <span class="circle ${element.color} flex justify-content-center align-items-center set-width-height-42"><span>${element.initials}</span></span>  
    `;
}

/**
 * Template for group initals on add task if more than 3 users are selected
 *
 * @export
 * @param {*} user
 * @returns {string}
 */
export function getGroupInitials(user) {
    return /*html*/`
        <span class="circle red flex justify-content-center align-items-center set-width-height-42"><span>+${user.length - 3}</span></span> 
    `;
}

/**
 * Template which return subtask with input field
 *
 * @export
 * @returns {string}
 */
export function getSubtaskInput() {
    return /*html*/`
        <div class="subtasks-add-box subtask-input p-right-8px">
            <div class="p-left-8px"><input id="add-new-subtask" class="add-new-subtask" type="text" placeholder="Add new task..."></div>
            <div onclick="addNewSubtask()" class="size-16px flex justify-content-center click-item clickable"><img src="../assets/icons/close.svg" alt=""></div>
            <div class="divider set-height-60"></div>
            <div onclick="pushNewSubtask()" class="size-16px flex justify-content-center click-item mg-left-8px clickable"><img class="filter-color-to-black" src="../assets/icons/check.svg" alt=""></div>
        </div>
    `;
}


/**
 * Template which return select box for selecting category
 *
 * @export
 * @returns {string}
 */
export function getCategory() {
    return /*html*/`
        <div class="grid grid-rows-2">
            <div class="mg-top-8px p-8px selection clickable" onclick="addCategory('User Story')">User Story</div>
            <div class="p-8px selection clickable" onclick="addCategory('Technical Task')">Technical Task</div>  
        </div> 
    `;
}

/**
 * Template for editing added subtask -> with input field
 *
 * @export
 * @param {*} element
 * @param {*} index
 */
export function editSubtask(element, index) {
    let edit = document.querySelector(`.added-subtask${index}`);
    edit.classList.remove('hide-added-subtasks-item-children');
    edit.innerHTML = /*html*/`
        <li class="p-left-8px"><input class="input-subtask" id="added-subtask-input${index}" type="text" placeholder="${element}"></li>  
        <div class="display-subtasks-mask">
            <div onclick="saveSubtaskEdit(${index})" class="flex justify-content-center">
                <img class="filter-color-to-black" src="../assets/icons/check.svg" alt="">
            </div>
            <div class="divider"></div>
            <div onclick="removeSubtask(${index})" class="flex justify-content-center">${trashSVG()}</div>
        </div>
    `;
}

/**
 * Template for editing added subtask -> without input field
 *
 * @export
 * @param {*} element
 * @param {*} index
 * @returns {string}
 */
export function getDisplaySubtaskMask(element, index) {
    return /*html*/`
        <div class="added-subtasks-item hide-added-subtasks-item-children added-subtask${index}">
            <li class="p-left-8px">${element.Description}</li>
            <div class="display-subtasks-mask">
                <div onclick="editSubtask('${element.Description}', ${index})" class="flex justify-content-center">${editSVG()}</div>
                <div class="divider"></div>
                <div onclick="removeSubtask(${index})" class="flex justify-content-center">${trashSVG()}</div>
            </div>
        </div> 
    `;
}


/**
 * Function which search contacts to find contact right contact informations
 *
 * @export
 * @param {*} data
 * @param {*} searchString
 * @returns {boolean}
 */
export function findPersons(data, searchString) {
    for (let index = 0; index < data.length; index++) {        
        if (data[index].email === searchString) return true;
    }
    return false;
}


/**
 * Function which return a template to display user informations
 * just display initials in a circle
 *
 * @param {*} element
 * @param {*} index
 * @returns {string}
 */
export function addUserItem(element, index) {
    let selectBox = "";
    if (findPersons(addedUser, element.email)) selectBox = checkedBoxSVG();
    else selectBox = uncheckedBoxSVG();
    return /*html*/`
        <div class="task-user-select grid grid-columns-3-48px-1fr-48px selection" onclick="addUser(${index})">
            <span class="circle ${element.color} flex justify-content-center align-items-center set-width-height-42"><span>${element.initials}</span></span> 
            <span class="username${index} flex align-items-center">${element.firstName} ${element.lastName}</span>
            <div class="flex align-items-center">${selectBox}</div>
        </div>
    `;
}


/**
 * Template which return add task html body -> form displayed into a grid
 * in large screen left and right side in small screen grid displayed in rows
 *
 * @export
 * @returns {string}
 */
export function getInputForm() {
    return /*html*/`
    <section id="add-task" class="add-task">
        <div class="add-task-head flex align-items-center">
            <div class="add-task-headline">
                <h1>Add Task</h1>
            </div>
        </div>
        <div class="task-form-container">
        <form id="create-task-form" class="task-form" onsubmit="createNewTask('To Do'); return false;">
            <div class="grid grid-rows-auto gap-64px">
                <div class="add-task-form">
                    <div class="part-1-form">
                        <div>
                            <!-- Titel -->
                            <span>Title<span class="required-star">*</span></span>
                            <input class="task-input" type="text" id="title" name="title" placeholder="Enter a title" required>
                        </div>
                        <div>
                            <span>Description</span>
                            <textarea class="task-textarea" id="description" name="description" rows="4" placeholder="Enter a description"></textarea>
                        </div>  
                        <div class="select-contact">
                            <span class="detailed-card-label">Assigned to:</span>
                            <div class="add-task-card-assigned-to grid grid-rows-2" >
                                <div class="assign-to-select-box p-right-8px clickable" onclick="addContact()">
                                    <span class="mg-left-8px">Select contacts to assign</span>
                                    <img id="contacts-toggle-img" class="click-item size-16px" src="../assets/icons/arrow_drop_downaa.svg" alt="">
                                </div>
                                <div class="select-box-contacts mg-top-minus-8px"></div>
                            </div>
                            <div class="display-assigned-user"></div>
                        </div>
                    </div>
                    <div class="divider"></div>
                    <div class="part-2-form">
                        <div>
                            <!-- Fälligkeitsdatum -->
                            <span>Due date<span class="required-star">*</span></span>
                            <input class="task-input" type="date" id="due-date" onchange="checkDate();" name="due_date" required>
                        </div>
                        <div class="select-priority">
                            <span class="flex detailed-card-label">Priority</span>
                            <div class="priority-buttons flex">
                                <button class="task-button grid grid-columns-2 clickable" type="button" id="urgent" data-priority="hoch" onclick="setPriority('urgent')">
                                    <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Urgent</span>    
                                    <div class="flex align-items-center set-height-100">${getPriority("Urgent")}</div>
                                </button>
                                <button class="task-button grid grid-columns-2 clickable" type="button" id="medium" data-priority="mittel" onclick="setPriority('medium')">
                                    <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Medium</span>    
                                    <div class="flex align-items-center set-height-100">${getPriority("Medium")}</div>
                                </button>
                                <button class="task-button grid grid-columns-2 clickable" type="button" id="low" data-priority="niedrig" onclick="setPriority('low')">
                                    <span class="flex align-items-center set-height-100 justify-content-center set-width-84px">Low</span>    
                                    <div class="flex align-items-center set-height-100">${getPriority("Low")}</div>
                                </button>
                            </div>
                        </div>
                        <div class="select-category">
                            <span class="mg-top-8px">Category<span class="required-star">*</span></span>

                            <div class="select-category-box p-right-8px clickable" onclick="chooseCategory()">
                                <!--<span class="mg-left-8px">Select category</span>-->
                                <input class="category-input" placeholder="Select category" type="text" id="category-input" name="category-input" required>
                                <img id="category-toggle-img" class="click-item size-16px" src="../assets/icons/arrow_drop_downaa.svg" alt="">
                            </div>
                            
                            <div class="add-category"></div>
                        </div>
                        <div class="add-new-subtask">
                            <span class="mg-top-8px">Subtasks</span>
                            <div class="add-new-subtask-box flex">
                                <div onclick="addNewSubtask()" class="subtasks-add-box p-right-8px clickable">
                                    <span class="mg-left-8px">Add new subtask</span>
                                    <img class="click-item size-16px" src="../assets/icons/subtasks_plus.svg" alt="">
                                </div>
                            </div>
                            <div class="added-subtasks"></div>
                        </div>
                    </div>
                </div>
                
            </div>
        </form>
    </div>
    <div class="add-task-form-bottom">
        <div class="flex required-info"><span class="required-star">*</span><span>This Field is required</span></div>
        <div></div>
        <div class="flex justify-content-flex-end">
            <button onclick="clearButton()" class="flex justify-content-center align-items-center btn-clear mg-right-8px clickable">
                <span class="mg-right-8px set-font-icon-700">Clear</span>
                <div class="flex align-items-center">${getCloseSVG()}</div>
            </button>
            <button form="create-task-form" type="submit" class="flex justify-content-center align-items-center btn-create-task clickable">
                <span class="mg-right-8px set-font-icon-700">Create Task</span>
                <img class="flex align-items-center" src="../assets/icons/check.svg" alt="">
            </button>
        </div>
    </div>
</section>
    `;
}