let emailInputRef = document.getElementById("emailInput");
let passwordInputRef = document.getElementById("passwordInput");
let chkboxRef = document.getElementById("login_checkbox");
const fileArray = ["summary.html", "boards.html", "add-task.html", "contacts.html", "help.html", "policy.html", "impressum.html"];


/**
 * Initializes the variables and shows popup after logout
 */
async function initLogin(){
  dataFromFirebase = await loadData(USERS_DIR);
  activeUser = await loadData(ACTIVE_DIR);
  for (let i = 0; i < fileArray.length; i++) {
    if (document.referrer.includes(fileArray[i]) && activeUser[0].loggedIn){
      logoutPopup();
    }  
  }
  loadCheckboxStatus();
}


/**
 * Loads user data
 */
async function showData(){
  await loadData(USERS_DIR);
}


/**
 * Shows error message after invalid input
 */
function showErrorMessage(){
  let errorRef = document.getElementById('error_message');
  errorRef.innerHTML = "Check your email and password. Please try again.";
  setTimeout(function(){
    errorRef.innerHTML = '';
  }, 3000);
}


/**
 * Checks if the password is valid and stores active user
 */
async function checkUserPassword(){
  let unknownUser = true;
  for (let i = 0; i < dataFromFirebase.length; i++) {
    if((emailInputRef.value === dataFromFirebase[i].email) && (passwordInputRef.value === dataFromFirebase[i].password)){
      unknownUser = false;
      activeUser = [
        {
          "firstName": dataFromFirebase[i].firstName,
          "lastName": dataFromFirebase[i].lastName,
          "initials": dataFromFirebase[i].initials,
          "email": dataFromFirebase[i].email,
          "loggedIn": true
        }];
      await putData(ACTIVE_DIR, activeUser);
      rememberMeCheck();
      window.location.href = './summary.html';
    }
  }
  if(unknownUser){
    showErrorMessage();
  }
  emailInputRef.value = '';
  passwordInputRef.value = '';
}


/**
 * Forwards to summary as a guest user and sets active user
 */
async function guestLogin(){
  activeUser = [
  {
    "firstName": "Guest",
    "lastName": "",
    "initials": "GG",
    "email": "guest@guest.de",
    "loggedIn": true
  }];
  await putData(ACTIVE_DIR, activeUser);
  window.location.href = "./summary.html";
}


/**
 * Toggles the password icon in order to show password in cleartext
 */
function togglePasswordIcon(){
  document.getElementById("hidepwd").classList.toggle("dnone");
  document.getElementById("showpwd").classList.toggle("dnone");
  let pwdInputRef = document.getElementById("passwordInput");
  if(document.getElementById("showpwd").classList.contains("dnone")){
    pwdInputRef.type = "password";
  } else {
    pwdInputRef.type = "text";
  }
}


/**
 * Animates the logo
 */
document.addEventListener("DOMContentLoaded", () => {
  let logoContainerRef = document.querySelector(".logo");
  let logoRef = document.querySelector(".img-logo");
  setTimeout(() => {
    logoRef.classList.add("logo-small");
    logoContainerRef.classList.add("ctn-transparent");
  }, 1000);
  setTimeout(() => {
    logoContainerRef.style.pointerEvents = "none";
    logoRef.style.zIndex = "101";
  }, 1500);
});


/**
 * Show popup after logging out
 */
function logoutPopup(){
  let popupRef = document.getElementById("logout_popup");
  setTimeout(() => {
    popupRef.style.visibility = "visible";
  }, 1500);
  setTimeout(function(){
    popupRef.style.visibility = "hidden";
  }, 3500);
  resetActiveUser();
}


/**
 * Resets the active user to empty string
 */
async function resetActiveUser(){
  activeUser = [
    {
      "firstName": "",
      "lastName": "",
      "initials": "",
      "email": "",
      "loggedIn": false
    }];
  await putData(ACTIVE_DIR, activeUser);
}


/**
 * Loads the checkbox status for remember me function
 */
function loadCheckboxStatus(){
  if (localStorage.checkbox && localStorage.checkbox !== "") {
    chkboxRef.setAttribute("checked", "checked");
    emailInputRef.value = localStorage.username;
  } else {
    chkboxRef.removeAttribute("checked");
    emailInputRef.value = "";
  }
}


/**
 * Stores the checkbox status in local storage
 */
function rememberMeCheck(){
  if (chkboxRef.checked && emailInputRef.value !== "") {
    localStorage.username = emailInputRef.value;
    localStorage.checkbox = chkboxRef.value;
  } else {
    localStorage.username = "";
    localStorage.checkbox = "";
  }
}


/**
 * Exports functions for further use
 */
window.initLogin = initLogin;
window.guestLogin = guestLogin;
window.togglePasswordIcon = togglePasswordIcon;
window.showData = showData;
window.checkUserPassword = checkUserPassword;