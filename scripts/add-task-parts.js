/*
    Author: Martin Reifschneider
*/
import { getSubtaskMask } from "./add-task-template.js";
import { closeCategory, closeContacts, toggleCategory, toggleContacts, toggleSubask, toggleSubtaskButton } from "./add-task.js";
let dateValue;

/**
 * Function to handle select box contacts button auto close if user click outside
 *
 * @param {*} event
 */

function handleSelectContactBox(event) {
    if(event.target.closest('.assign-to-select-box')) return;
    if (!event.target.closest('.task-user-select')) {
        toggleContacts();
        closeContacts();
    }
}

/**
 * Function to handle select box category button auto close if user click outside
 *
 * @param {*} event
 */

function handleSelectCategoryBox(event) {
    if (!event.target.closest('.select-category-box'))  {
        toggleCategory();
        closeCategory();
    }
}

/**
 * Function to handle subtask button auto close if user click outside
 *
 * @param {*} event
 */
function handleSelectSubtaskButton(event) {
    if (!event.target.closest('.subtasks-add-box')) {   
        if(toggleSubtaskButton) {          
            let subtask = document.querySelector('.add-new-subtask-box');
            subtask.innerHTML = getSubtaskMask();
            toggleSubask();
        }
    }
}

/**
 * Function for starting event listener that close opened select boxes on add task
 *
 * @export
 */
export function addListener() {  
    const taskForm = document.querySelector('.task-form-container');
    if(taskForm == null) return;
    document.addEventListener("click", (event) => { 
        handleSelectContactBox(event);
        handleSelectCategoryBox(event)
        handleSelectSubtaskButton(event)
    });
}

/**
 * Function for date validation
 *
 * @param {*} d
 * @returns {string}
 */
export function validateDate(d) {
    // Prüfen, ob d ein gültiges Datum ist
    if (!isNaN(d.getTime())) {
        const today = new Date(); // aktuelles Datum

        // Wenn das eingegebene Datum vor dem heutigen Datum liegt
        if (d < today) {
            return "";
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Monate sind 0-basiert
        const day = String(d.getDate()).padStart(2, '0'); // Tag formatieren
        return `${year}-${month}-${day}`;
    }

    return "";
}


/**
 * Function for formating date
 *
 * @param {*} input
 * @returns {string}
 */
function formatDate(input) {
    const datePattern1 = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    
    if (datePattern1.test(input)) {
      const [ , day, month, year] = input.match(datePattern1);
      return `${year}-${month}-${day}`;  // yyyy-mm-dd Format
    }
  
    const d = new Date(input);
    return validateDate(d);
  }


function checkDate() {
    const d = new Date(document.getElementById('due-date').value);
    dateValue = document.getElementById('due-date').value;
    let date = formatDate(d);   
    
    if(date != "") {
        document.getElementById('due-date').setCustomValidity('');
        document.getElementById('due-date').value = date;        
    }
    else {
        document.getElementById('due-date').setCustomValidity('Date is in the past!');
        document.getElementById('due-date').value = dateValue;
    }
}


window.checkDate = checkDate;