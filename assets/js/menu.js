(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    const mountNode = document.getElementById("site-menu-mount");
    if (!mountNode) return;

    fetch("menu.html", { cache: "no-store" })
      .then(function (response) {
        if (!response.ok) throw new Error("HTTP " + response.status);
        return response.text();
      })
      .then(function (html) {
        mountNode.innerHTML = html;
        activatePublicNav();
        bindSectionAwareState();
      })
      .catch(function (error) {
        console.error("Gagal memuat menu bersama:", error);
      });
  });

  function activatePublicNav() {
    const currentPage = document.body ? (document.body.getAttribute("data-page") || "") : "";
    const activeKey = currentPage === "katalog" ? "katalog" : getCurrentHashKey() || "beranda";
    setActiveLink(activeKey);
  }

  function bindSectionAwareState() {
    const currentPage = document.body ? (document.body.getAttribute("data-page") || "") : "";
    if (currentPage === "katalog") return;

    const observedKeys = ["beranda", "promo", "tentang", "menu-hari-ini", "menu-besok", "kepercayaan", "kontak"];
    const sections = observedKeys
      .map(function (key) { return document.getElementById(key); })
      .filter(Boolean);

    if (!sections.length || typeof IntersectionObserver !== "function") {
      window.addEventListener("hashchange", function () {
        setActiveLink(getCurrentHashKey() || "beranda");
      });
      return;
    }

    const observer = new IntersectionObserver(function (entries) {
      const visibleEntries = entries.filter(function (entry) { return entry.isIntersecting; });
      if (!visibleEntries.length) return;
      visibleEntries.sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; });
      setActiveLink(visibleEntries[0].target.id);
    }, {
      rootMargin: "-35% 0px -45% 0px",
      threshold: [0.1, 0.25, 0.4, 0.6]
    });

    sections.forEach(function (section) {
      observer.observe(section);
    });

    window.addEventListener("hashchange", function () {
      setActiveLink(getCurrentHashKey() || "beranda");
    });
  }

  function getCurrentHashKey() {
    const hash = window.location.hash ? window.location.hash.slice(1) : "";
    return hash || "";
  }

  function setActiveLink(activeKey) {
    const navLinks = document.querySelectorAll("[data-nav-key]");
    navLinks.forEach(function (link) {
      const isActive = link.getAttribute("data-nav-key") === activeKey;
      link.classList.toggle("active", isActive);
      if (isActive) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    });

    document.querySelectorAll(".public-nav-dropdown .dropdown-toggle").forEach(function (toggle) {
      toggle.classList.remove("active");
    });

    const activeLink = document.querySelector('[data-nav-key="' + activeKey + '"]');
    const dropdown = activeLink ? activeLink.closest(".public-nav-dropdown") : null;
    if (dropdown) {
      const toggle = dropdown.querySelector(".dropdown-toggle");
      if (toggle) toggle.classList.add("active");
    }
  }
})();
