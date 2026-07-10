document.addEventListener("DOMContentLoaded", () => {
  const socialLinks = [
    [".fa-facebook-f", "Facebook", "https://www.facebook.com/"],
    [".fa-twitter", "Twitter", "https://twitter.com/"],
    [".fa-google", "Google", "https://www.google.com/"],
  ];
  socialLinks.forEach(([icon, label, url]) => {
    document.querySelectorAll(`a:has(${icon})`).forEach((link) => {
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.setAttribute("aria-label", label);
    });
  });
  // Check the login status on page load
  const isLoggedIn = Boolean(window.demoAuth?.currentUser());
  checkLoginStatus(isLoggedIn);

  // if there are any masseges, disply them
  if (localStorage.message) {
    const toastTrigger = document.getElementById("liveToastBtn");
    const toastLiveExample = document.getElementById("liveToast");

    const toastBootstrap =
      bootstrap.Toast.getOrCreateInstance(toastLiveExample);
    document.getElementById("message").innerText = localStorage.message;
    localStorage.removeItem("message");
    toastBootstrap.show();
  }
  // Retrieve and log user information if available
  if (localStorage.usersData && localStorage.userEmail) {
    let user = JSON.parse(localStorage.usersData).find(
      (user) => user.email === localStorage.userEmail
    );
  }
});

function checkLoginStatus(isLoggedIn) {
  if (isLoggedIn) {
    document.getElementById("service").style.display = "block";
    document.getElementById("services").style.display = "block";
    document.getElementById("profile-info").style.display = "block";
    document.getElementById("login").style.display = "none";
    document.getElementById("register").style.display = "none";
    document.getElementById("logout").style.display = "block";
  } else {
    let services = document.getElementById("service");
    if (services) document.getElementById("service").parentElement.remove();
    document.getElementById("services").parentElement.remove();
    document.getElementById("profile-info").style.display = "none";
    document.getElementById("login").style.display = "block";
    document.getElementById("register").style.display = "block";
    document.getElementById("logout").style.display = "none";
  }
}

function logout() {
  window.demoAuth?.logout();
}
let logoutBtn = document.getElementById("logout");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
