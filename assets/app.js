(function () {
  const THEME_KEY = 'crm_theme';
  const CONTACT_KEY = 'crm_contacts_seeded';
  const CONFIG_KEY = 'crm_playbook_config';

  const CONTACTS = [
    { id: 'C-1001', name: 'Mara Ellison', company: 'Northline Freight', segment: 'Enterprise Logistics', owner: 'Ari Chen', stage: 'Expansion', health: 'Strong', arr: '$124,000', poster: 'linear-gradient(135deg,#0f172a,#334155,#e50914)', activities: [{ time: '2026-02-19 10:40', type: 'Call', note: 'Reviewed Q2 rollout plan and adoption targets.' }, { time: '2026-02-16 09:10', type: 'Email', note: 'Sent onboarding checklist and stakeholder map.' }, { time: '2026-02-09 15:00', type: 'Meeting', note: 'Security review complete. Procurement approved.' }] },
    { id: 'C-1002', name: 'Jonah Reyes', company: 'Crestpoint Health', segment: 'Mid-Market Healthcare', owner: 'Nia Patel', stage: 'Pilot', health: 'At Risk', arr: '$58,000', poster: 'linear-gradient(135deg,#312e81,#1f2937,#dc2626)', activities: [{ time: '2026-02-18 14:20', type: 'Task', note: 'FOE activity records requested for compliance committee.' }, { time: '2026-02-12 11:00', type: 'Call', note: 'Addressed concerns around data migration timeline.' }, { time: '2026-02-07 16:30', type: 'Email', note: 'Shared pilot KPI dashboard and escalation path.' }] },
    { id: 'C-1003', name: 'Priya Nambiar', company: 'Aster Retail Group', segment: 'Enterprise Retail', owner: 'Leo Kim', stage: 'Renewal', health: 'Watch', arr: '$91,500', poster: 'linear-gradient(135deg,#111827,#374151,#b91c1c)', activities: [{ time: '2026-02-20 08:45', type: 'Meeting', note: 'Presented ROI summary and cross-region benchmark.' }, { time: '2026-02-13 13:30', type: 'Call', note: 'Resolved contract redlines with legal team.' }, { time: '2026-02-03 10:00', type: 'Task', note: 'Queued renewal motion in weekly exec review.' }] },
    { id: 'C-1004', name: 'Darren Cole', company: 'Pioneer Public Services', segment: 'Public Sector', owner: 'Mina Sol', stage: 'Onboarding', health: 'Strong', arr: '$47,200', poster: 'linear-gradient(135deg,#1e293b,#0f766e,#ef4444)', activities: [{ time: '2026-02-21 09:25', type: 'Email', note: 'Confirmed stakeholder training schedule.' }, { time: '2026-02-15 12:10', type: 'Task', note: 'Imported contact hierarchy and support tiers.' }, { time: '2026-02-10 17:45', type: 'Call', note: 'Validated success criteria for first 60 days.' }] }
  ];

  const defaultConfig = { audience: 'Exec Leadership', mode: 'Narrative', focus: ['Renewal Risk'], readiness: 'Standard', finalizedAt: null };

  function saveSeed() {
    if (!localStorage.getItem(CONTACT_KEY)) {
      const seeded = CONTACTS.map((c) => ({ ...c, notes: [] }));
      localStorage.setItem(CONTACT_KEY, 'true');
      localStorage.setItem('crm_contacts', JSON.stringify(seeded));
    }
    if (!localStorage.getItem(CONFIG_KEY)) localStorage.setItem(CONFIG_KEY, JSON.stringify(defaultConfig));
  }
  function getContacts() { return JSON.parse(localStorage.getItem('crm_contacts') || '[]'); }
  function setContacts(list) { localStorage.setItem('crm_contacts', JSON.stringify(list)); }
  function getConfig() { return JSON.parse(localStorage.getItem(CONFIG_KEY) || JSON.stringify(defaultConfig)); }
  function setConfig(cfg) { localStorage.setItem(CONFIG_KEY, JSON.stringify(cfg)); }

  const App = {
    wizardStep: 1,
    selectedContactId: null,
    setTheme(next) { localStorage.setItem(THEME_KEY, next); document.documentElement.setAttribute('data-theme', next); },
    initTheme() {
      const stored = localStorage.getItem(THEME_KEY) || 'dark';
      document.documentElement.setAttribute('data-theme', stored);
      const btn = document.getElementById('themeToggle');
      if (btn) {
        btn.textContent = stored === 'dark' ? 'Light mode' : 'Dark mode';
        btn.onclick = () => { const now = document.documentElement.getAttribute('data-theme') || 'dark'; const next = now === 'dark' ? 'light' : 'dark'; App.setTheme(next); btn.textContent = next === 'dark' ? 'Light mode' : 'Dark mode'; };
      }
    },
    renderContacts() {
      const rail = document.getElementById('contactRail');
      const search = document.getElementById('contactSearch');
      if (!rail) return;
      const contacts = getContacts();
      function draw(list) {
        rail.innerHTML = list.map((c) => `<article class="contact-card" data-id="${c.id}"><div class="poster" style="background:${c.poster}"><small>${c.segment}</small><strong>${c.company}</strong></div><div class="card-meta"><div><strong>${c.name}</strong></div><div style="margin:.35rem 0;color:var(--muted)">${c.stage} · ${c.arr}</div><span class="chip">${c.health}</span> <span class="chip">Notes: ${(c.notes || []).length}</span></div></article>`).join('');
        rail.querySelectorAll('.contact-card').forEach((card) => { card.onclick = () => App.openFoeRecord(card.getAttribute('data-id')); });
      }
      draw(contacts);
      if (search) search.oninput = (e) => { const q = e.target.value.toLowerCase(); draw(contacts.filter((c) => JSON.stringify(c).toLowerCase().includes(q))); };
    },
    openFoeRecord(id) {
      App.selectedContactId = id;
      const contact = getContacts().find((c) => c.id === id);
      const drawer = document.getElementById('foeDrawer');
      const body = document.getElementById('foeBody');
      if (!drawer || !body || !contact) return;
      const notesHtml = (contact.notes || []).map((n) => `<li><time>${n.time}</time><div>${n.text}</div></li>`).join('') || '<li><div>No notes yet.</div></li>';
      body.innerHTML = `<h2 style="margin:0 0 .2rem">${contact.name}</h2><p style="margin:0;color:var(--muted)">${contact.company} · Owner: ${contact.owner}</p><div class="tips"><strong>Tips:</strong> Use notes + editing to show realistic account management depth.</div><h3 style="margin:.5rem 0">FOE Activity Records</h3><ul class="timeline">${contact.activities.map((a) => `<li><time>${a.time} · ${a.type}</time><div>${a.note}</div></li>`).join('')}</ul><h3>Account Notes</h3><ul class="timeline">${notesHtml}</ul><div class="stack"><input id="noteInput" placeholder="Add note for this account" /><button class="btn" id="addNoteBtn">Save note</button><button class="btn" id="editContactBtn">Edit contact profile</button></div>`;
      drawer.classList.add('open');
      document.getElementById('addNoteBtn').onclick = App.addNote;
      document.getElementById('editContactBtn').onclick = App.openEditModal;
    },
    closeDrawer() { const drawer = document.getElementById('foeDrawer'); if (drawer) drawer.classList.remove('open'); },
    addNote() {
      const input = document.getElementById('noteInput');
      if (!input || !input.value.trim() || !App.selectedContactId) return;
      const contacts = getContacts();
      const ix = contacts.findIndex((c) => c.id === App.selectedContactId);
      if (ix < 0) return;
      contacts[ix].notes = contacts[ix].notes || [];
      contacts[ix].notes.unshift({ time: new Date().toISOString().slice(0, 16).replace('T', ' '), text: input.value.trim() });
      setContacts(contacts);
      App.renderContacts();
      App.renderPipelineTable();
      App.openFoeRecord(App.selectedContactId);
    },
    openEditModal() {
      const modal = document.getElementById('editModal');
      const c = getContacts().find((x) => x.id === App.selectedContactId);
      if (!modal || !c) return;
      modal.classList.add('open');
      document.getElementById('editName').value = c.name;
      document.getElementById('editOwner').value = c.owner;
      document.getElementById('editStage').value = c.stage;
      document.getElementById('editHealth').value = c.health;
    },
    saveEdit() {
      const contacts = getContacts();
      const ix = contacts.findIndex((c) => c.id === App.selectedContactId);
      if (ix < 0) return;
      contacts[ix].name = document.getElementById('editName').value;
      contacts[ix].owner = document.getElementById('editOwner').value;
      contacts[ix].stage = document.getElementById('editStage').value;
      contacts[ix].health = document.getElementById('editHealth').value;
      setContacts(contacts);
      App.closeEditModal();
      App.renderContacts();
      App.renderPipelineTable();
      App.openFoeRecord(App.selectedContactId);
    },
    closeEditModal() { const modal = document.getElementById('editModal'); if (modal) modal.classList.remove('open'); },
    renderPipelineTable() {
      const el = document.getElementById('pipelineBody');
      if (!el) return;
      el.innerHTML = getContacts().map((c) => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.company}</td><td>${c.stage}</td><td>${c.owner}</td><td>${c.health}</td><td>${c.arr}</td></tr>`).join('');
    },
    renderFeed() {
      const el = document.getElementById('activityFeed');
      if (!el) return;
      const items = getContacts().flatMap((c) => [...c.activities, ...(c.notes || []).map((n) => ({ time: n.time, type: 'Note', note: n.text }))].map((a) => ({ ...a, name: c.name, company: c.company }))).sort((a, b) => b.time.localeCompare(a.time));
      el.innerHTML = items.slice(0, 14).map((a) => `<li><time>${a.time}</time><strong>${a.type}</strong> · ${a.name} (${a.company})<br>${a.note}</li>`).join('');
    },
    renderConfigSummary() {
      const el = document.getElementById('configSummary');
      if (!el) return;
      const c = getConfig();
      el.innerHTML = `<strong>${c.audience}</strong> · ${c.mode} · Focus: ${c.focus.join(', ')} · Readiness: ${c.readiness}${c.finalizedAt ? ` · Finalized ${c.finalizedAt}` : ''}`;
    },
    goStep(step) {
      App.wizardStep = Math.min(3, Math.max(1, step));
      document.querySelectorAll('[data-step]').forEach((n) => n.classList.add('hidden'));
      const view = document.querySelector(`[data-step="${App.wizardStep}"]`);
      if (view) view.classList.remove('hidden');
      const lbl = document.getElementById('stepLabel');
      if (lbl) lbl.textContent = `Step ${App.wizardStep} of 3`;
    },
    initWizard() {
      const shell = document.getElementById('wizard');
      if (!shell) return;
      const cfg = getConfig();
      document.getElementById('cfgAudience').value = cfg.audience;
      document.getElementById('cfgMode').value = cfg.mode;
      document.getElementById('cfgReadiness').value = cfg.readiness;
      document.querySelectorAll('input[name="focus"]').forEach((cb) => { cb.checked = cfg.focus.includes(cb.value); });
      document.getElementById('nextStep').onclick = () => App.goStep(App.wizardStep + 1);
      document.getElementById('prevStep').onclick = () => App.goStep(App.wizardStep - 1);
      document.getElementById('saveConfig').onclick = () => {
        const nextCfg = {
          audience: document.getElementById('cfgAudience').value,
          mode: document.getElementById('cfgMode').value,
          readiness: document.getElementById('cfgReadiness').value,
          focus: Array.from(document.querySelectorAll('input[name="focus"]:checked')).map((n) => n.value),
          finalizedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
        };
        setConfig(nextCfg);
        App.renderConfigSummary();
      };
      App.goStep(1);
      App.renderConfigSummary();
    }
  };

  window.VeloraPlayground = App;
  document.addEventListener('DOMContentLoaded', () => {
    saveSeed();
    App.initTheme();
    App.renderContacts();
    App.renderPipelineTable();
    App.renderFeed();
    App.initWizard();
    const close = document.getElementById('closeDrawer');
    if (close) close.onclick = App.closeDrawer;
    const saveEditBtn = document.getElementById('saveEditBtn');
    const closeEditBtn = document.getElementById('closeEditBtn');
    if (saveEditBtn) saveEditBtn.onclick = App.saveEdit;
    if (closeEditBtn) closeEditBtn.onclick = App.closeEditModal;
  });
})();
