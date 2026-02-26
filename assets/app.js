(function () {
  const THEME_KEY = 'velora_theme';
  const MODE_KEY = 'velora_demo_mode';
  const SESSION_KEY = 'velora_session';

  const App = {
    keys: { THEME_KEY, MODE_KEY, SESSION_KEY },
    getTheme: () => localStorage.getItem(THEME_KEY) || 'light',
    setTheme: (theme) => localStorage.setItem(THEME_KEY, theme),
    getMode: () => localStorage.getItem(MODE_KEY) || 'before',
    setMode: (mode) => localStorage.setItem(MODE_KEY, mode),
    getSession: () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'),
    setSession: (username) => localStorage.setItem(SESSION_KEY, JSON.stringify({ username, loginAt: new Date().toISOString() })),
    clearSession: () => localStorage.removeItem(SESSION_KEY),
    requireAuth: () => {
      if (!App.getSession()) {
        window.location.href = '/portal/login.html';
      }
    },
    applyUiState: () => {
      document.documentElement.setAttribute('data-theme', App.getTheme());
      document.body.classList.remove('mode-before', 'mode-after');
      document.body.classList.add(App.getMode() === 'after' ? 'mode-after' : 'mode-before');
      const statusEls = document.querySelectorAll('[data-demo-status]');
      statusEls.forEach((el) => {
        const after = App.getMode() === 'after';
        el.textContent = after ? 'After: Structured' : 'Before: Unstructured';
        el.className = `badge ${after ? 'after' : 'before'}`;
      });
      const modeLabels = document.querySelectorAll('[data-mode-label]');
      modeLabels.forEach((el) => el.textContent = App.getMode() === 'after' ? 'After' : 'Before');
    },
    initTopbar: () => {
      const holder = document.getElementById('global-topbar');
      if (!holder) return;
      holder.innerHTML = `
        <div class="topbar">
          <div><a href="/index.html" class="brand">Velora Proving Ground</a></div>
          <div class="topbar-controls">
            <button id="themeToggle">Theme</button>
            <button id="modeToggle">Demo Mode: <span data-mode-label></span></button>
            <span data-demo-status class="badge"></span>
          </div>
        </div>`;
      document.getElementById('themeToggle').addEventListener('click', () => {
        const next = App.getTheme() === 'dark' ? 'light' : 'dark';
        App.setTheme(next);
        App.applyUiState();
      });
      document.getElementById('modeToggle').addEventListener('click', () => {
        const next = App.getMode() === 'after' ? 'before' : 'after';
        App.setMode(next);
        App.applyUiState();
      });
      App.applyUiState();
    },
    fetchJson: async (path) => (await fetch(path)).json(),
    fetchText: async (path) => (await fetch(path)).text(),
  };

  window.VeloraApp = App;
  document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem(THEME_KEY)) localStorage.setItem(THEME_KEY, 'light');
    if (!localStorage.getItem(MODE_KEY)) localStorage.setItem(MODE_KEY, 'before');
    App.initTopbar();
    App.applyUiState();
  });
})();
