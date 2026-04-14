(function () {
  "use strict";

  function activateCurrentNav() {
    var currentPage = document.body ? (document.body.getAttribute("data-page") || "") : "";
    var activeKey = currentPage === "katalog" ? "katalog" : "";

    if (!activeKey) return;

    var activeLink = document.querySelector('[data-nav-key="' + activeKey + '"]');
    if (!activeLink) return;

    activeLink.classList.add("active");
    activeLink.setAttribute("aria-current", "page");

    var dropdown = activeLink.closest(".public-nav-dropdown");
    if (dropdown) {
      var toggle = dropdown.querySelector(".dropdown-toggle");
      if (toggle) {
        toggle.classList.add("active");
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    var mountNode = document.getElementById("site-menu-mount");
    if (!mountNode) return;

    fetch("menu.html", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        mountNode.innerHTML = html;
        activateCurrentNav();
      })
      .catch(function (error) {
        console.error("Gagal memuat menu bersama:", error);
      });
  });
})();
