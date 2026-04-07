(function () {
  "use strict";

  const app = window.RMBJAdmin;

  app.bootstrapState = async function bootstrapState() {
    const saved = localStorage.getItem(app.STORAGE_KEY);
    if (saved) {
      app.state = app.normalizePayload(JSON.parse(saved));
      return;
    }

    try {
      const response = await fetch("data/menu.json", { cache: "no-store" });
      if (!response.ok) throw new Error("Gagal memuat data/menu.json");
      app.state = app.normalizePayload(await response.json());
      app.persist();
      app.flash("success", "Data awal dimuat dari data/menu.json.");
    } catch (error) {
      app.state = app.createEmptyState();
      app.persist();
      app.flash("error", "Dashboard dimulai dari kondisi kosong.");
    }
  };

  app.initDashboard = async function initDashboard() {
    if (!app.initialized) {
      await app.restoreStoredHandles();
      app.setupCategoryOptions();
      app.bindDashboard();
      await app.bootstrapState();
      app.initialized = true;
    }

    app.selectedIds.clear();
    app.resetForm();
    app.closeModal();
    app.renderAll();
  };

  document.addEventListener("DOMContentLoaded", async () => {
    app.bindLogin();
    if (!app.isLoggedIn()) {
      app.showLogin();
      return;
    }
    app.showDashboard();
    await app.initDashboard();
  });
})();
