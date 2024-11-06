/**
 * returns summary with variables from tasks-JSON
 * @returns HTML-Template 
 */
function getTemplateMainSummary(){
  return `
    <section class="summary-section">
        <div class="header-main" id="header_main">
          <h1>Join 360</h1>
          <span>Key Metrics at a Glance</span>
        </div>

        <div class="data-ctn">
          <div class="object-data" id="object_data">

            <div class="todo-done-ctn">
              <div class="todo bgwhite-colblack-br30 w264h168" onclick="openBoards()">
                <div class="circle69"><img src="../assets/icons/edit.png" alt=""></div>
                <div><p class="font64colblackw600">${getNumberToDoTasks()}</p><p class="color2A">To-Do</p></div>
              </div>
              <div class="done bgwhite-colblack-br30 w264h168" onclick="openBoards()">
                <div class="circle69"><img src="../assets/icons/Vector@2x.png" alt=""></div>
                <div><p class="font64colblackw600" id="done_tasks">${getNumberDoneTasks()}</p><p class="color2A">Done</p></div>
              </div>
            </div>

            <div class="urgent-ctn bgwhite-colblack-br30 w560h168" onclick="openBoards()">
              <div class="urgent-left-side">
                <div class="circle-urgent"><img src="../assets/icons/Prio alta.png" alt=""></div>
              
                <div class="urgent-data">
                  <p class="font64colblackw600" id="urgent_tasks">${getNumberUrgentTasks()}</p>
                  <p class="color2A">Urgent</p>
                </div>
              
              </div>
              <div class="date-ctn">
                <p class="font21w700">${getDeadlineMonth()}&nbsp;${getDeadlineDay()},&nbsp;${getDeadlineYear()}</p>
                <p class="font16w400">Upcoming Deadline</p>
              </div>
            </div>

            <div class="tasks-ctn">
              <div class="board bgwhite-colblack-br30 w168h168" onclick="openBoards()"><p class="font64colblackw600">${getTasksInBoard()}</p><p class="color2A">Tasks in Board</p></div>
              <div class="progress bgwhite-colblack-br30 w168h168" onclick="openBoards()"><p class="font64colblackw600">${getNumberTasksInProgress()}</p><p class="color2A">Tasks in Progress</p></div>
              <div class="feedback bgwhite-colblack-br30 w168h168" onclick="openBoards()"><p class="font64colblackw600">${getNumberTasksAwaitingFeedback()}</p><p class="color2A">Awaiting Feedback</p></div>
            </div>
            
          </div>

          <div id="greeting_ctn" class="greeting-ctn"></div>

        </div>

      </section>
  `;
}


/**
 * HTML-Template for Greeting
 * @param {string} greetFormula contains greeting depending on daytime
 * @returns HTML-Template
 */
function getGreetingTemplate(greetFormula){
  return `
    <p class="greeting-formula">${greetFormula},</p>
    <p class="greeting-person">${currentUserFirstName}&nbsp;${currentUserLastName}</p>
  `;
}


/**
 * This function returns the html for the rendering of each contact
 *
 * @param {Array} contact - this is a single contact info
 * @returns HTML-Template for contact
 */
function getContactHTML(contact, index) {
  return `
    <button class="single-contact-btn flex align-items-center" onclick="showContactInfo(${index})">
            <span class="circle ${contact.color} flex justify-content-center align-items-center">
              <span>${contact.initials}</span>
            </span>
            <span class="name-email flex flex-column">
              <span class="contact-name">${contact.firstName} ${contact.lastName}</span>
              <span class="contact-email">${contact.email}</span>
            </span>
          </button>
    `;
}

/**
 * This function returns the html-template for the contact-info of a clicked contact 
 * 
 * @returns HTML-Template for contact info
 */
function getContactInfoTemplate(index) {
  return `
   <div class="contact-info">
    
              <div class="single-contact-large flex align-items-center">
                <div
                  class="circle ${currentContact.color} circle-large circle-info flex justify-content-center align-items-center"
                >
                  <span>${currentContact.initials}</span>
                </div>
                <div class="name-email flex flex-column">
                  <div class="contact-name-large">${currentContact.firstName} ${currentContact.lastName}</div>
                  <div class="icon-container flex icon-container-closed">
                    <button class="contact-icon-btn flex align-items-center" onclick="renderEditContactDialog(${index})">
                      <img src="../assets/img/edit.svg" alt="" class="info-icon"/>
                      <span>Edit</span>
                    </button>
                    <button class="contact-icon-btn flex align-items-center" onclick="deleteContact(${index})">
                      <img src="../assets/img/delete.svg" alt="" class="info-icon"/>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div class="contact-info-text flex align-items-center">
              Contact Information
            </div>
            <div
              class="email-phone-container flex flex-column"
              style="gap: 22px"
            >
              <div class="email flex flex-column" style="gap: 15px">
                <div style="font-weight: 700">Email</div>
                <div class="contact-email">${currentContact.email}</div>
              </div>
              <div class="phone flex flex-column" style="gap: 15px">
                <div style="font-weight: 700">Phone</div>
                <div>${currentContact.phone}</div>
              </div>
            </div>
            `;
}

/**
 * This function returns the html-template of a new Letter-Section in the conatctlist
 * 
 * @param {String} firstLetter 
 * @returns HTML-Template for first letter
 */
function getNewSectionHTML(firstLetter) {
  return `
  <div class="letter">${firstLetter}</div>
  `;
}
