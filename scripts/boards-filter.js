/*
    Author: Martin Reifschneider
*/


import { getOverlay } from "./boards-overlay.js";
import { clearColumns, showData } from "./boards.js";
import { setZoom } from "./boards-events.js";
export let searchList = [];
export let sortedList = [];


/**
 * Help function for comparing values it called from search function
 * it comaring from two sides of an array 
 *
 * @param {*} array
 * @param {*} key
 * @param {*} value
 * @param {*} i
 * @param {*} j
 * @returns {boolean}
 */
function checkValue(array, key, value, i, j) {
    if (array[i][key] === value || array[j][key] === value) return true;
    else if (array[i] === value || array[j] === value) return true;
    return false;
}

/**
 * Search function which walks from start and end of an array to middle to find
 * it will called for finding empty columns
 *
 * @export
 * @param {*} array
 * @param {*} key
 * @param {*} value
 * @returns {boolean}
 */
export function search(array, key, value) {
    if(array == null || array.length < 1) return false;
    let i = 0, j = array.length - 1;
    do {
        if (checkValue(array, key, value, i, j)) return true;
        ++i;
        --j;
    } while (i < j);
    return false;
}


/**
 * Function for date validation
 *
 * @param {*} d
 * @returns {string}
 */
function validateDate(d) {
    if (!isNaN(d.getTime())) {
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');  // Monate sind 0-basiert
        const day = String(d.getDate()).padStart(2, '0');  // Tag formatieren
        return `${year}-${month}-${day}`;
      }

    return "Invalid date";
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


/**
 * Filter function for search input to find and highlight tasks
 * all entries can be searched -> title, description, priority, date, subtasks and persons
 *
 * @param {*} data
 * @param {*} searchString
 * @returns {*}
 */
function filterByNestedKeyAndArray(data, searchString) {
    return data.filter(item => {
        const title = item.Title.toLowerCase().includes(searchString.toLowerCase());
        const date = item.Date.toLowerCase().includes(formatDate(formatDate(searchString)).toLowerCase());
        const priority = item.Priority.toLowerCase().includes(searchString.toLowerCase());
        const description = item.Description.toLowerCase().includes(searchString.toLowerCase());
        const subtasks = (item.Subtasks != null) ? item.Subtasks.some(member => member.Description.toLowerCase().includes(searchString.toLowerCase())) : null;        
        const persons = (item.Persons != null) ? item.Persons.some(member => member.toLowerCase().includes(searchString.toLowerCase())) : null;
        return title || persons || date || priority || description || subtasks;
    });
}


/**
 * Function to merge to arrays
 *
 * @param {*} oldArray
 * @param {*} newArray
 * @returns {*}
 */
function mergeArraysWithoutDuplicates(oldArray, newArray) {
    const combinedArray = newArray.concat(oldArray);
    const uniqueArray = combinedArray.filter((item, index, self) =>
        index === self.findIndex((t) => t.id === item.id)
    );

    return uniqueArray;
}


/**
 * Function to highlight searched results - optional if you want highlighted results
 *
 * @param {*} result
 */
function highlightResults(result) {    
    if(result != null && result.length > 0 && result.length != tasksFromFirebase.length)  {
        tasksFromFirebase.forEach(element => { document.getElementById('taskId' + element.id).style.backgroundColor = '#E7E7E7'; });
        result.forEach(element => { document.getElementById('taskId' + element.id).style.backgroundColor = 'white'; });
        return;
    }    
    tasksFromFirebase.forEach(element => { document.getElementById('taskId' + element.id).style.backgroundColor = 'white'; });
}


function noResults() {
    let overlay = getOverlay()
    overlay.innerHTML = /*html*/`
         <section class="detailed-card grid-rows-auto">
            No results
        </section>
    `;
}


/**
 * Function which order searched and found tasks to top or to start of 
 * each arranged column
 *
 * @param {*} input
 */
function orderTasks(input) {
    const searchString = input.value;
    const result = filterByNestedKeyAndArray(tasksFromFirebase, searchString);
    if(result.length == 0 || result == null) {
        //noResults();
        clearColumns();
        showData(result);
        return;
    }
    showData(result);
}


/** Function which called after entry in input field -> search */
function searchEntry() {
    let input = document.getElementById('boards-search');
    if (input.value === "") {
        setZoom(1.0, true);
        return;
    }
    orderTasks(input);
    setZoom(0.35, false);
}


window.searchEntry = searchEntry;