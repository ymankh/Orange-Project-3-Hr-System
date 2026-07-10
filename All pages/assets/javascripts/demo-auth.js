(function () {
  const sessionKey = "demoAuthSession";
  const duration = 8 * 60 * 60 * 1000;

  function users() {
    try {
      const value = JSON.parse(localStorage.getItem("usersData") || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function session() {
    try {
      return JSON.parse(sessionStorage.getItem(sessionKey));
    } catch {
      return null;
    }
  }

  function currentUser() {
    const activeSession = session();
    if (!activeSession || activeSession.expiresAt <= Date.now()) {
      logout(false);
      return null;
    }
    return users().find((user) => user.email === activeSession.email) || null;
  }

  function login(user) {
    sessionStorage.setItem(sessionKey, JSON.stringify({
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      email: user.email,
      issuedAt: Date.now(),
      expiresAt: Date.now() + duration
    }));
    localStorage.setItem("loggedIn", "true");
    localStorage.setItem("userEmail", user.email);
  }

  function logout(redirect = true) {
    sessionStorage.removeItem(sessionKey);
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("loggedInUser");
    if (redirect) window.location.href = window.location.pathname.includes("/All%20pages/") ||
      window.location.pathname.includes("/All pages/") ? "../index.html" : "index.html";
  }

  function requireAuth() {
    if (currentUser()) return true;
    const loginUrl = window.location.pathname.includes("/All%20pages/") ||
      window.location.pathname.includes("/All pages/") ? "login.html" : "All pages/login.html";
    window.location.replace(loginUrl);
    return false;
  }

  window.demoAuth = { currentUser, login, logout, requireAuth };
  if (document.body?.dataset.requiresAuth === "true") requireAuth();
})();
