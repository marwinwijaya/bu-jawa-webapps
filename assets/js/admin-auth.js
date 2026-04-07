(function () {
  "use strict";

  const app = window.RMBJAdmin;

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
    const username = (document.querySelector("#login-username")?.value || "").trim();
    const password = document.querySelector("#login-password")?.value || "";
    if (username === app.LOGIN_USERNAME && password === app.LOGIN_PASSWORD) {
      sessionStorage.setItem(app.SESSION_KEY, "logged_in");
      clearLoginError();
      clearLoginForm();
      app.showDashboard();
      app.initDashboard();
      app.flash("success", "Login admin berhasil.");
      return;
    }
    setLoginError("Username atau password salah. Silakan periksa kembali.");
  };

  app.onLogout = function onLogout() {
    sessionStorage.removeItem(app.SESSION_KEY);
    app.closeModal();
    app.showLogin();
    clearLoginForm();
    clearLoginError();
    app.flash("success", "Anda telah logout dari panel admin.");
  };

  app.isLoggedIn = function isLoggedIn() {
    return sessionStorage.getItem(app.SESSION_KEY) === "logged_in";
  };

  app.showLogin = function showLogin() {
    document.querySelector("#login-screen")?.classList.remove("is-hidden");
    document.querySelector("#admin-shell")?.classList.add("is-hidden");
  };

  app.showDashboard = function showDashboard() {
    document.querySelector("#login-screen")?.classList.add("is-hidden");
    document.querySelector("#admin-shell")?.classList.remove("is-hidden");
  };
})();
