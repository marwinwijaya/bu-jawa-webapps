(function () {
  "use strict";

  const app = window.RMBJAdmin;

  function getLoginPagePath() {
    return "login.html";
  }

  function getAdminPagePath() {
    return "admin.html";
  }

  function setLoginError(message) {
    const target = document.querySelector("#login-error");
    if (target) target.textContent = message;
  }

  function clearLoginError() {
    setLoginError("");
  }

  function clearLoginForm() {
    app.setValue("#login-username", "");
    app.setValue("#login-password", "");
  }

  app.bindLogin = function bindLogin() {
    document.querySelector("#login-form")?.addEventListener("submit", app.onLogin);
    document.querySelector("#logout-button")?.addEventListener("click", app.onLogout);
  };

  app.onLogin = function onLogin(event) {
    event.preventDefault();
    clearLoginError();

    const username = (document.querySelector("#login-username")?.value || "").trim();
    const password = document.querySelector("#login-password")?.value || "";

    if (!username || !password) {
      setLoginError("Username dan password wajib diisi.");
      return;
    }

    if (username === app.LOGIN_USERNAME && password === app.LOGIN_PASSWORD) {
      sessionStorage.setItem(app.SESSION_KEY, "logged_in");
      clearLoginForm();
      window.location.replace(getAdminPagePath());
      return;
    }

    setLoginError("Username atau password salah.");
  };

  app.onLogout = function onLogout() {
    sessionStorage.removeItem(app.SESSION_KEY);
    app.closeModal?.();
    window.location.replace(getLoginPagePath());
  };

  app.isLoggedIn = function isLoggedIn() {
    return sessionStorage.getItem(app.SESSION_KEY) === "logged_in";
  };

  app.redirectToLogin = function redirectToLogin() {
    window.location.replace(getLoginPagePath());
  };

  app.redirectToAdmin = function redirectToAdmin() {
    window.location.replace(getAdminPagePath());
  };

  app.requireLogin = function requireLogin() {
    if (app.isLoggedIn()) return true;
    app.redirectToLogin();
    return false;
  };

  app.redirectIfLoggedIn = function redirectIfLoggedIn() {
    if (!app.isLoggedIn()) return false;
    app.redirectToAdmin();
    return true;
  };
})();
