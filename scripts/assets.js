/**
 * This function is used to open and close the dropdown menu
 */
document.addEventListener("DOMContentLoaded", function () {
  const dropdownButton = document.querySelector(".user-profil");
  const dropdownMenu = document.getElementById("dropdown-menu");

  dropdownButton.addEventListener('click', function (event) {
      dropdownMenu.classList.toggle('d_none');
      event.stopPropagation(); 
  });

  // Closes dropdown menu when clicking anywhere else on the body
  document.body.addEventListener('click', function () {
      if (!dropdownMenu.classList.contains('d_none')) {
          dropdownMenu.classList.add('d_none');
      }
  });
});