let nameInputRef = document.getElementById("nameInput");
let emailInputRef = document.getElementById("emailInput");
let passwordInputRef = document.getElementById("passwordInput");
let passwordInputConfirmRef = document.getElementById("passwordInputConfirm");

let contactsUser = [];


/**
 * Fills the variables with data from firebase on init
 */
async function initSignup(){
  dataFromFirebase = await loadData(USERS_DIR);
  activeUser = await loadData(ACTIVE_DIR);
  contactsUser = await loadData(CONTACTS_DIR);
}


/**
 * Executes the signup process
 */
function signUpUser(){
  addUser();
}


/**
 * Checks if both passwords are identical
 * @returns boolean
 */
function checkCorrectPassword(){
  if(passwordInputRef.value === passwordInputConfirmRef.value){
    return true;
  } else {
    return false;
  }
}


/**
 * Returns number of spaces within a string
 * @param {string} str string that needs to be checked
 * @returns number of spaces in string
 */
function checkCountSpaces(str){
  let count = (str.split(" ").length - 1);
  return count;
}


/**
 * Resets all values to default
 */
function resetValues(){
  emailInputRef.value = '';
  nameInputRef.value = '';
  passwordInputRef.value = '';
  passwordInputConfirmRef.value = '';
  document.getElementById("btn").disabled = "true";
  document.getElementById("checkbox").checked = false;
}


/**
 * Display error message depending on input string
 * @param {string} str string that represents the error message
 */
function showErrorMessage(str){
  let errorRef = document.getElementById('error_message');
  let errorStr = 'Error';
  if(str === "wrongPassword"){errorStr = 'Passwords do not match!';} else
  if(str === "emailExists"){errorStr = 'Email already exists!';} else
  if(str === "nameFormatIncorrect"){errorStr = 'Please enter first and last name!';}
  errorRef.innerHTML += errorStr + `<br>`;
  setTimeout(function(){
    errorRef.innerHTML = '';
  }, 4000);
}


/**
 * Shows successful signup and forwards to summary
 */
async function signupSuccess(){
  openPopup();
  resetValues();
  await putData(ACTIVE_DIR, activeUser);
  await putData(USERS_DIR, dataFromFirebase);
  await putData(CONTACTS_DIR, contactsUser);
  setTimeout(function(){window.location.href = "./summary.html"}, 2500);
}


/**
 * Checks if email already exists
 * @returns boolean
 */
function emailNotExists(){
  let emailCheck = true;
  for(let i = 0; i < contactsUser.length; i++){
    if(emailInputRef.value == contactsUser[i].email){
      emailCheck = false;
    }
  }
  return emailCheck;
}


/**
 * Adds user to firebase after checking everything
 */
function addUser(){
  let spaces = checkCountSpaces(nameInputRef.value);
  if((checkCorrectPassword()) && (emailNotExists()) && (spaces === 1)){
    let firstName = nameInputRef.value.split(' ')[0];
    let lastName = nameInputRef.value.split(' ')[1];
    pushEverythingNecessaryToFireBase(firstName, lastName);
    signupSuccess();
  } else {
    if(spaces !== 1){showErrorMessage('nameFormatIncorrect');}
    if(!emailNotExists()){showErrorMessage('emailExists');}
    if(!checkCorrectPassword()){showErrorMessage('wrongPassword');}
  }
}


/**
 * Pushes all user data to firebase
 * @param {string} first first name of the user
 * @param {string} last last name of the user
 */
function pushEverythingNecessaryToFireBase(first, last){
  dataFromFirebase.push({
    "email": emailInputRef.value,
    "firstName": first,
    "initials": first[0] + last[0],
    "lastName": last,
    "password": passwordInputRef.value
  });
  activeUser = [
    {
      "email": emailInputRef.value,
      "firstName": first,
      "lastName": last,
      "initials": first[0] + last[0],
      "loggedIn": true
    }];
  contactsUser.push({
      "color": getRandomColor(),
      "email": emailInputRef.value,
      "firstName": first,
      "initials": first[0] + last[0],
      "lastName": last,
      "phone": ""
  });
}


/**
 * Enables or disables the signup button
 */
function enableButtonAfterChecked(){
  let checkRef = document.getElementById("checkbox");
  let buttonRef = document.getElementById("btn");
  if(checkRef.checked){
    buttonRef.removeAttribute("disabled");
  } else {
    buttonRef.disabled = "true";
  }
}


/**
 * Checks if all input fields are filled
 * @returns boolean if every field is filled
 */
function everyInputFieldFilled(){
  return (nameInputRef.value != "") && (emailInputRef.value != "") && (passwordInputRef.value != "") && (passwordInputConfirmRef.value != "");
}


/**
 * Toggles the password icon
 * @param {number} pwdIdx password-index
 */
function togglePasswordIcon(pwdIdx){
  document.getElementById("hidepwd" + pwdIdx).classList.toggle("dnone");
  document.getElementById("showpwd" + pwdIdx).classList.toggle("dnone");
  let pwdInputRef;
  if(pwdIdx == 1){
    pwdInputRef = document.getElementById("passwordInput");
  } else {
    pwdInputRef = document.getElementById("passwordInputConfirm");
  }
  if(document.getElementById("showpwd" + pwdIdx).classList.contains("dnone")){
    pwdInputRef.type = "password";
  } else {
    pwdInputRef.type = "text";
  }
}


/**
 * Checks if all input fields are filled
 */
function checkForm(){
  let formRef = document.forms['signupform'].elements;
  const realLength = formRef.length - 2;
  let allFieldsFilled = true;
  for (let i = 0; i < realLength; i++) {
    if(formRef[i].value.length == 0){
      allFieldsFilled = false;
    }
  }
  if(allFieldsFilled){enableButtonAfterChecked();}
  else {document.getElementById("btn").disabled = "true";}
}


/**
 * Opens popup
 */
function openPopup(){
  let popup = document.getElementById("popupsuccess");
  popup.classList.add("open-popup");
}
