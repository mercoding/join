const contactListRef = document.getElementById("contact-container");
const singleContactRef = document.getElementById("single-contact");
const contactInfoRef = document.getElementById("contactInfoSection");
const addContactBtn = document.getElementById("addContactBtn");
const editBtnMobile = document.getElementById("editBtnMobile")


let contactList = [];
let currentContact = [];

let userList = [];
let userIndex;

let taskIndexes = [];  // contains all indexes of tasks in which the current user is assigned to

let activeUserIndex;

let firstName;
let lastName;
let initials;

/**
 * This function loads the contactdata from firebase and renders the contact list
 */
async function initContacts() {
  activeUser = await loadData(ACTIVE_DIR);
  checkIfLoggedIn();
  contactList = await loadData(CONTACTS_DIR);
  tasksFromFirebase = await loadData(TASKS_DIR);
  checkScreenSize();
  renderContactList();
  getLogo();
  userList = await loadData(USERS_DIR);
  
}

/**
 * This function renders the contacts on the page
 */
function renderContactList() {
  contactListRef.innerHTML = "";
  sortContactsByFirstName();

  for (let index = 0; index < contactList.length; index++) {
    const contact = contactList[index];
    addNewContactSection(index);
    contactListRef.innerHTML += getContactHTML(contact, index);
  }
  markActiveUser();
}

/**
 * This function adds a new Letter-Section to the contactlist on the page
 *
 * @param {*} index
 */
function addNewContactSection(index) {
  if (index == 0) {
    let firstLetter = contactList[index].firstName.charAt(0).toUpperCase();
    contactListRef.innerHTML += getNewSectionHTML(firstLetter);
  } else {
    if (
      contactList[index].firstName.charAt(0).toUpperCase() !==
      contactList[index - 1].firstName.charAt(0).toUpperCase()
    ) {
      let firstLetter = contactList[index].firstName.charAt(0).toUpperCase();
      contactListRef.innerHTML += getNewSectionHTML(firstLetter);
    }
  }
}

/**
 * This function finds loged-in-User in contact-List and adds "(you)" im Namen
 */
function markActiveUser() {
  if(activeUser[0].email !== "guest@guest.de") {
  const contactNameRef = document.querySelectorAll(".contact-name");
  activeUserIndex = contactList.findIndex((contact) => contact.email == activeUser[0].email);
  contactNameRef[activeUserIndex].innerHTML += " (you)";
  }
}
 
/**
 * This function sorts the contacts alphabetically
 *
 * @param {Array} contacts - this is the json array with all contacts
 */
function sortContactsByFirstName() {
  contactList.sort((a, b) => a.firstName.localeCompare(b.firstName));
}

/**
 * This function renders the information of a clicked contact
 *
 * @param {*} index
 */
function showContactInfo(index) {
  checkIfMobileSize();
  currentContact = contactList[index];
  singleContactRef.innerHTML = "";
  singleContactRef.innerHTML = getContactInfoTemplate(index);
  toggleActiveBtnColor(index);
  singleContactRef.classList.remove('single-contact-closed'); //animation
}

/**
 * This function checks if ScreenSize is small when a contact is clicked and shows mobile elements
 */
function checkIfMobileSize() {
  if(window.innerWidth < 1200){
    addContactBtn.classList.add("d_none");
    addContactBtn.classList.remove("flex")
    editBtnMobile.classList.remove("d_none");
    editBtnMobile.classList.add("flex"); 
    contactInfoRef.classList.remove("d_none");
  } 
}

/**
 * 
 * @param {Number} btnIndex 
 */
function toggleActiveBtnColor(btnIndex) {
  const contactBtns = document.querySelectorAll(".single-contact-btn");
  for (let index = 0; index < contactBtns.length; index++) {
    const element = contactBtns[index];
    if (element == contactBtns[btnIndex]) {
      element.classList.add("single-contact-btn-active");
      element.scrollIntoViewIfNeeded();
    } else {
      element.classList.remove("single-contact-btn-active");
    }
  }
}

/**
 * This function closes an opend contact info
 */
function closeContactInfo() {
  singleContactRef.innerHTML = "";
}

/**
 * This function animates the edit-menu when contact-info is shown on mobile
 */
function toggleEditMenu() {
  const editContainer = document.querySelectorAll(".icon-container ")[0];
  editContainer.classList.remove("icon-container-closed");

}

/**
 * This function closes the Contact Info on small screens
 */
function closeContactInfoMobile(){
  const contactBtns = document.querySelectorAll(".single-contact-btn");
  contactInfoRef.classList.add("d_none");
  editBtnMobile.classList.add("d_none");
  editBtnMobile.classList.remove("flex");
  addContactBtn.classList.remove("d_none");
  addContactBtn.classList.add("flex");
  contactBtns.forEach((button) => button.classList.remove("single-contact-btn-active"));
}

  /**
  * This function checks if the size of the screen is under 1200px 
  */ 
  function checkScreenSize() {
    if (window.innerWidth < 1200) {
      contactInfoRef.classList.add('d_none');
      editBtnMobile.classList.add("d_none");
      document.getElementById("close").classList.add("filter-color-to-white")
    } else {
      contactInfoRef.classList.remove('d_none');
      document.getElementById("close").classList.remove("filter-color-to-white")
    }
  }

  // Monitors screen size changes
  window.addEventListener('resize', checkScreenSize);


/**
 * This function assigns input values to contact variables
 */
function assignContactData() {
  firstName = inputNameRef.value.split(" ")[0];
  firstName = firstName.charAt(0).toUpperCase() + firstName.slice(1);
  lastName = inputNameRef.value.split(" ")[1];
  initials = findInitials();
}

/**
 * This function adds a new contact to firebase
 *
 */
async function addNewContact() {
 assignContactData();
  contactList.push({
    color: getRandomColor(),
    email: inputEmailRef.value,
    firstName: firstName,
    initials: initials,
    lastName: lastName,
    phone: inputPhoneRef.value,
  });
  sortContactsByFirstName();
  renderContactList();
  btnIndex = contactList.findIndex((contact) => contact.email === inputEmailRef.value);
  showContactInfo(btnIndex);
  closeContactDialog();
  animateSuccessMessage();
  await putData(CONTACTS_DIR, contactList);
}

/**
 * This function animates the success message if a new contact was made
 */
function animateSuccessMessage(){
  const successNoteRef = document.getElementById('successNote');
  successNoteRef.classList.remove('success-note-closed');
  setTimeout(() => {
    successNoteRef.classList.add('success-note-closed');
  }, "1500");
}

/**
 * This function returns the initials of the name of a contact
 *
 * @param {*} initials
 * @returns initials of contact
 */
function findInitials() {
  if (lastName !== undefined) {
    initials = firstName.charAt(0) + lastName.charAt(0);
  } else {
    initials = firstName.charAt(0);
    lastName = ""; // empty string, because if not, page shows undefined
  }
  return initials;
}

/**
 * This function adds a color to each contact
 *
 * @param {Number} index
 */
function addContactColor() {
  for (let index = 0; index < contactList.length; index++) {
    let contactIndex = index % contactColors.length; // because there can be more contacts than colors in "contactColors"
    contactList[index].color = contactColors[contactIndex];
  }
}

/**
 * This function deletes a contact
 *
 * @param {Number} index
 */
async function deleteContact(index) {
  checkIfContactUser();
  deleteUser();
  updateTaskList();
  contactList.splice(index, 1);
  renderContactList();
  closeContactInfo();
  closeContactDialog();
  await putData(CONTACTS_DIR, contactList);
  await putData(USERS_DIR, userList);
  await putData(TASKS_DIR, tasksFromFirebase);
}


  function updateTaskList() {
    tasksFromFirebase.forEach(task => {
      if (task.Persons && Array.isArray(task.Persons)) {  
        const index = task.Persons.indexOf(currentContact.email);
        if (index !== -1) {
          task.Persons.splice(index, 1); 
        }
      }
    });
  }


/**
 * This function checks if the currentConatct is a User, if it is, then it deletes it from the userList
 */
async function checkIfContactUser() {
  //if 
  userIndex = userList.findIndex((user) => user.email === currentContact.email);
}

/**
 * This function deletes a user
 */
function deleteUser() {
  if (userIndex != -1){
    userList.splice(userIndex, 1); // if contact is also a user, user gets deleted
  } 
}

/**
 * This function checks if the opened contact is the current active user, if it is, the info of active-user will also be changed
 * @param {*} index 
 */
async function checkIfOpenedContactIsActiveUser(index){
  if(index == activeUserIndex){
    activeUser[0] = {
    email: inputEmailRef.value,
    firstName: firstName,
    initials: initials,
    lastName: lastName
    };

    await putData(ACTIVE_DIR, activeUser);
  }
}

/**
 * This function updates a contact info, after it was edited
 *
 * @param {Number} index
 */
async function updateContactInfo(index) {
  assignContactData();
  updateEmailInTasks();

  contactList[index] = {
    color: currentContact.color,
    email: inputEmailRef.value,
    firstName: firstName,
    initials: initials,
    lastName: lastName,
    phone: inputPhoneRef.value,
  };
  checkIfOpenedContactIsActiveUser(index);
  checkIfContactUser();
  updateUserInfo(index);
  sortContactsByFirstName();
  renderContactList();
  btnIndex = contactList.findIndex((contact) => contact.email === inputEmailRef.value);
  showContactInfo(btnIndex);
  closeContactDialog();
  await putData(CONTACTS_DIR, contactList);
  await putData(USERS_DIR, userList);
  await putData(TASKS_DIR, tasksFromFirebase);
}

/**
 * This function updates the email adress in all tasks the contact is assigned to
 */
function updateEmailInTasks() {
  taskIndexes.forEach((changedEmail) => {
    if(taskIndexes != []){
    tasksFromFirebase[changedEmail.taskIndex].Persons[changedEmail.personIndex] = inputEmailRef.value;
    }
  });
}

/**
 * This function checks if the currentConatct is a User, if it is, then it updates then user information
 */
async function updateUserInfo(index) {
  // if contact is also a user, user gets edited
  if (userIndex != -1){
  userList[userIndex].email = contactList[index].email;
  userList[userIndex].firstName = contactList[index].firstName;
  userList[userIndex].lastName = contactList[index].lastName;    
  } 
}

