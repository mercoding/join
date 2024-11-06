// Dialog
const dialog = document.querySelector("dialog");
const errorMessage = document.getElementById("error-message");

// Dialog Contactform
const dialogTitle = document.getElementById("dialog-title");
const dialogSubline = document.getElementById("dialogSubline");
const dialogColor = document.getElementById("dialogColor");
const dialogInitials = document.getElementById("dialogInitials");
const contactForm = document.getElementById("contactForm");

// Dialog Contactform Buttons
const cancelBtnTitle = document.getElementById("cancelBtnTitle");
const cancelBtn = document.getElementById("cancelBtn");
const submitBtnTitle = document.getElementById("submitBtnTitle");
const checkIcon = document.getElementById("checkIcon");

//Dialog Contactform Input Fields
const inputNameRef = document.getElementById("c-name");
const inputEmailRef = document.getElementById("c-email");
const inputPhoneRef = document.getElementById("c-phone");

let emailExists;

/**
 * This function opens the dialog
 */
function openContactDialog() {
  dialog.showModal();
  dialog.classList.remove('show');
  dialog.classList.add('bg');
}

/**
 * This function closes the dialog
 */
function closeContactDialog() {
  dialog.classList.add('show');
  dialog.classList.remove('bg');
        setTimeout(() => {dialog.close();
 contactForm.reset();
  dialogColor.classList.remove(currentContact.color);
  errorMessage.classList.add("d_none");
  cancelBtn.classList.add("flex"); //was removed if add-dialog was opened beforehand (on mobile)
        }, 500); // Close dialog after animation completes
}

/**
 * This function validates the form
 */
function checkForm() {
  errorMessage.classList.add("d_none");
  emailExists = checkContactEmail();
  if (contactForm.checkValidity() && !emailExists) {
    submitBtn.classList.remove("inactiv-btn");
    checkIcon.classList.remove("inactive-color");
    errorMessage.classList.add("d_none");
  } else {
    submitBtn.classList.add("inactiv-btn");
    checkIcon.classList.add("inactive-color");
  }
}

// validates input fields
inputNameRef.addEventListener("input", checkForm);
inputEmailRef.addEventListener("input", checkForm);
inputPhoneRef.addEventListener("input", checkForm);

/**
 * This function checks if entered email already exists
 * @returns - false, for does not exists or true, for does exist
 */
function checkContactEmail() {
  emailExists = contactList.some(
    (contact) => contact.email === inputEmailRef.value
  );
  if (emailExists) {
    //if email exists check if this email is in currentContact, if it is return false
    if (currentContact != [] && currentContact.email === inputEmailRef.value) {
      errorMessage.classList.add("d_none");
      return !emailExists;
    } else {
      errorMessage.classList.remove("d_none");
      return emailExists;
    }
  }
}

/**
 * This function renders the dialog to add a contact
 *
 */
function renderAddContactDialog() {
  dialogTitle.innerHTML = "Add Contact";
  dialogSubline.innerHTML = "Tasks are better with a team!";
  dialogInitials.innerHTML ='<img src="../assets/icons/person.svg" alt="" class="circle-icon" />';
  cancelBtnTitle.innerHTML = "Cancel";
  submitBtnTitle.innerHTML = "Create Contact";
  cancelBtn.onclick = function () {closeContactDialog()};
  fillOnsubmitAddForm();
  submitBtn.classList.add("inactiv-btn");
  checkIcon.classList.add("inactive-color");
  if (window.innerWidth < 1200) { cancelBtn.classList.add("d_none"); cancelBtn.classList.remove("flex")}
  openContactDialog();
}

function  fillOnsubmitAddForm(){
  contactForm.onsubmit = function () {
    if (!emailExists) {
      addNewContact();
      errorMessage.classList.add("d_none");
    } else {
    return false;
    }
  };
};

/**
 * This function renders the dialog to edit a chosen contact
 *
 * @param {Number} index
 */
function renderEditContactDialog(index) {
  dialogTitle.innerHTML = "Edit Contact";
  dialogSubline.innerHTML = "";
  cancelBtnTitle.innerHTML = "Delete";
  submitBtnTitle.innerHTML = "Save";
  dialogColor.classList.add(currentContact.color);
  dialogInitials.innerHTML = currentContact.initials;
  fillCancelBtnOnclick(index);
  fillOnsubmitEditForm(index);
  fillInputFields(index);
  saveIndexesIfEmailInTask(); // if email of contact gets changed, indexes of persons email in tasks need to be saved. So email can get updated in all task in case contact information changes
  submitBtn.classList.remove("inactiv-btn");
  checkIcon.classList.remove("inactive-color");
  openContactDialog();
}

/**
 * This function saves the index/es of task/s in which the currentContact is in, as well as the exact position (indexPerson) within the task
 */
function saveIndexesIfEmailInTask() {
  tasksFromFirebase.forEach((task, index) => {
    // Prüfen, ob .Persons existiert und ein Array ist
    if (task.Persons && Array.isArray(task.Persons)) {  
      const personIndex = task.Persons.indexOf(currentContact.email);
      if (personIndex !== -1) {
        taskIndexes.push({"taskIndex": index, "personIndex": personIndex }); 
      }
    }
  });
}


/**
 * This function fills input fields with current contact information
 *
 * @param {Number} index
 */
function fillInputFields(index) {
  inputNameRef.value =
  contactList[index].firstName + " " + contactList[index].lastName;
  inputEmailRef.value = contactList[index].email;
  inputPhoneRef.value = contactList[index].phone;
}

function fillCancelBtnOnclick(index) {
  cancelBtn.onclick = function () {
    deleteContact(index);
    dialogColor.classList.remove(currentContact.color);
    errorMessage.classList.add("d_none");
  };
}

function fillOnsubmitEditForm(index) {
  contactForm.onsubmit = function () {
    if (!emailExists) {
      updateContactInfo(index);
      dialogColor.classList.remove(currentContact.color);
      errorMessage.classList.add("d_none");
    } else {
      return false;
    }
  };
}
