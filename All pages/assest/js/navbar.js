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
  const elements = {
    service: document.getElementById("service"),
    services: document.getElementById("services"),
    profile: document.getElementById("profile-info"),
    login: document.getElementById("login"),
    register: document.getElementById("register"),
    logout: document.getElementById("logout"),
  };
  const setVisible = (element, visible) => {
    if (element) element.style.display = visible ? "block" : "none";
  };

  if (isLoggedIn) {
    setVisible(elements.service, true);
    setVisible(elements.services, true);
    setVisible(elements.profile, true);
    setVisible(elements.login, false);
    setVisible(elements.register, false);
    setVisible(elements.logout, true);
  } else {
    const isLoginPage = window.location.pathname.toLowerCase().endsWith("/login.html");
    setVisible(elements.service, false);
    setVisible(elements.services, false);
    setVisible(elements.profile, false);
    setVisible(elements.logout, false);
    setVisible(elements.login, !isLoginPage);
    setVisible(elements.register, isLoginPage);
  }
}

function logout() {
  window.demoAuth?.logout();
}
let logoutBtn = document.getElementById("logout");
if (logoutBtn) logoutBtn.addEventListener("click", logout);
