(function () {
  const K = {
    THEME: 'crm_theme',
    SEEDED: 'crm_seeded_v2',
    CONTACTS: 'crm_contacts',
    DEALS: 'crm_deals',
    TASKS: 'crm_tasks',
    PLAYBOOK: 'crm_playbook_config'
  };

  const SEED = {
    contacts: [
      { id: 'C-1001', name: 'Mara Ellison', company: 'Northline Freight', segment: 'Enterprise Logistics', owner: 'Ari Chen', stage: 'Expansion', health: 'Strong', arr: 124000, poster: 'linear-gradient(135deg,#0f172a,#334155,#e50914)', activities: [{ time: '2026-02-19 10:40', type: 'Call', note: 'Reviewed Q2 rollout plan and adoption targets.' }], notes: [] },
      { id: 'C-1002', name: 'Jonah Reyes', company: 'Crestpoint Health', segment: 'Mid-Market Healthcare', owner: 'Nia Patel', stage: 'Pilot', health: 'At Risk', arr: 58000, poster: 'linear-gradient(135deg,#312e81,#1f2937,#dc2626)', activities: [{ time: '2026-02-18 14:20', type: 'Task', note: 'FOE activity records requested for committee.' }], notes: [] },
      { id: 'C-1003', name: 'Priya Nambiar', company: 'Aster Retail Group', segment: 'Enterprise Retail', owner: 'Leo Kim', stage: 'Renewal', health: 'Watch', arr: 91500, poster: 'linear-gradient(135deg,#111827,#374151,#b91c1c)', activities: [{ time: '2026-02-20 08:45', type: 'Meeting', note: 'Presented ROI summary and benchmark.' }], notes: [] },
      { id: 'C-1004', name: 'Darren Cole', company: 'Pioneer Public Services', segment: 'Public Sector', owner: 'Mina Sol', stage: 'Onboarding', health: 'Strong', arr: 47200, poster: 'linear-gradient(135deg,#1e293b,#0f766e,#ef4444)', activities: [{ time: '2026-02-21 09:25', type: 'Email', note: 'Confirmed stakeholder training schedule.' }], notes: [] }
    ],
    deals: [
      { id: 'D-1', company: 'Northline Freight', stage: 'Discovery', value: 42000, owner: 'Ari Chen' },
      { id: 'D-2', company: 'Crestpoint Health', stage: 'Proposal', value: 68000, owner: 'Nia Patel' },
      { id: 'D-3', company: 'Aster Retail Group', stage: 'Negotiation', value: 99000, owner: 'Leo Kim' },
      { id: 'D-4', company: 'Pioneer Public Services', stage: 'Closed Won', value: 37000, owner: 'Mina Sol' }
    ],
    tasks: [
      { id: 'T-1', title: 'Renewal risk review', owner: 'Leo Kim', due: '2026-03-02', status: 'Open' },
      { id: 'T-2', title: 'Executive prep', owner: 'Ari Chen', due: '2026-03-01', status: 'Open' }
    ],
    playbook: { audience: 'Exec Leadership', mode: 'Narrative', focus: ['Renewal Risk'], readiness: 'Standard', finalizedAt: null }
  };

  const F = {
    get: (k, d) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d)),
    set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
    money: (n) => `$${n.toLocaleString()}`,
    now: () => new Date().toISOString().slice(0, 16).replace('T', ' ')
  };

  function seed() {
    if (!localStorage.getItem(K.SEEDED)) {
      F.set(K.CONTACTS, SEED.contacts);
      F.set(K.DEALS, SEED.deals);
      F.set(K.TASKS, SEED.tasks);
      F.set(K.PLAYBOOK, SEED.playbook);
      localStorage.setItem(K.SEEDED, 'true');
    }
  }

  const App = {
    selectedContactId: null,
    wizardStep: 1,

    contacts: () => F.get(K.CONTACTS, []),
    setContacts: (v) => F.set(K.CONTACTS, v),
    deals: () => F.get(K.DEALS, []),
    setDeals: (v) => F.set(K.DEALS, v),
    tasks: () => F.get(K.TASKS, []),
    setTasks: (v) => F.set(K.TASKS, v),

    initTheme() {
      const v = localStorage.getItem(K.THEME) || 'dark';
      document.documentElement.setAttribute('data-theme', v);
      const b = document.getElementById('themeToggle');
      if (b) b.onclick = () => {
        const now = document.documentElement.getAttribute('data-theme') || 'dark';
        const next = now === 'dark' ? 'light' : 'dark';
        localStorage.setItem(K.THEME, next);
        document.documentElement.setAttribute('data-theme', next);
      };
    },

    renderOverview() {
      const contacts = App.contacts();
      const deals = App.deals();
      const tasks = App.tasks();
      const open = tasks.filter((t) => t.status === 'Open').length;
      const risk = contacts.filter((c) => c.health !== 'Strong').length;
      const pipeline = deals.reduce((a, d) => a + d.value, 0);
      const ids = [['mPipeline', F.money(pipeline)], ['mContacts', String(contacts.length)], ['mOpenTasks', String(open)], ['mRisk', String(risk)]];
      ids.forEach(([id, val]) => { const n = document.getElementById(id); if (n) n.textContent = val; });
    },

    renderContacts() {
      const rail = document.getElementById('contactRail');
      if (!rail) return;
      const all = App.contacts();
      const qInput = document.getElementById('contactSearch');
      const draw = (list) => {
        rail.innerHTML = list.map((c) => `<article class="contact-card" data-id="${c.id}"><div class="poster" style="background:${c.poster}"><small>${c.segment}</small><strong>${c.company}</strong></div><div class="card-meta"><div><strong>${c.name}</strong></div><div class="subtle">${c.stage} · ${F.money(c.arr)}</div><div class="stack"><span class="chip">${c.health}</span><span class="chip">Notes ${(c.notes||[]).length}</span></div></div></article>`).join('');
        rail.querySelectorAll('.contact-card').forEach((el) => el.onclick = () => App.openContact(el.dataset.id));
      };
      draw(all);
      if (qInput) qInput.oninput = (e) => {
        const q = e.target.value.toLowerCase();
        draw(all.filter((x) => JSON.stringify(x).toLowerCase().includes(q)));
      };
    },

    openContact(id) {
      App.selectedContactId = id;
      const c = App.contacts().find((x) => x.id === id);
      const drawer = document.getElementById('foeDrawer');
      const body = document.getElementById('foeBody');
      if (!c || !drawer || !body) return;
      body.innerHTML = `<h2>${c.name}</h2><p class="subtle">${c.company} · ${c.owner}</p><div class="tips"><strong>Tips:</strong> Update profile fields and notes while speaking through lifecycle context.</div>
      <h3>FOE Activity Records</h3><ul class="timeline">${c.activities.map((a) => `<li><time>${a.time} · ${a.type}</time><div>${a.note}</div></li>`).join('')}</ul>
      <h3>Notes</h3><ul class="timeline">${(c.notes||[]).map((n) => `<li><time>${n.time}</time><div>${n.text}</div></li>`).join('') || '<li><div>No notes yet.</div></li>'}</ul>
      <div class="stack"><input id="noteInput" placeholder="Add note" /><button class="btn" id="addNoteBtn">Save note</button><button class="btn" id="editContactBtn">Edit profile</button></div>`;
      drawer.classList.add('open');
      document.getElementById('addNoteBtn').onclick = App.addNote;
      document.getElementById('editContactBtn').onclick = App.openEditModal;
    },

    addNote() {
      const t = document.getElementById('noteInput')?.value?.trim();
      if (!t || !App.selectedContactId) return;
      const list = App.contacts();
      const i = list.findIndex((x) => x.id === App.selectedContactId);
      if (i < 0) return;
      list[i].notes.unshift({ time: F.now(), text: t });
      list[i].activities.unshift({ time: F.now(), type: 'Note', note: t });
      App.setContacts(list);
      App.openContact(App.selectedContactId);
      App.renderContacts();
      App.renderActivityFeed();
      App.renderTable();
    },

    openEditModal() {
      const c = App.contacts().find((x) => x.id === App.selectedContactId);
      const m = document.getElementById('editModal');
      if (!c || !m) return;
      m.classList.add('open');
      document.getElementById('editName').value = c.name;
      document.getElementById('editOwner').value = c.owner;
      document.getElementById('editStage').value = c.stage;
      document.getElementById('editHealth').value = c.health;
    },

    saveEdit() {
      const list = App.contacts();
      const i = list.findIndex((x) => x.id === App.selectedContactId);
      if (i < 0) return;
      Object.assign(list[i], {
        name: document.getElementById('editName').value,
        owner: document.getElementById('editOwner').value,
        stage: document.getElementById('editStage').value,
        health: document.getElementById('editHealth').value
      });
      App.setContacts(list);
      document.getElementById('editModal')?.classList.remove('open');
      App.openContact(App.selectedContactId);
      App.renderContacts();
      App.renderTable();
    },

    renderTable() {
      const b = document.getElementById('pipelineBody');
      if (!b) return;
      b.innerHTML = App.contacts().map((c) => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.company}</td><td>${c.stage}</td><td>${c.owner}</td><td>${c.health}</td><td>${F.money(c.arr)}</td></tr>`).join('');
    },

    renderActivityFeed() {
      const el = document.getElementById('activityFeed');
      if (!el) return;
      const rows = App.contacts().flatMap((c) => c.activities.map((a) => ({ ...a, who: c.name, company: c.company })));
      rows.sort((a,b)=>b.time.localeCompare(a.time));
      el.innerHTML = rows.slice(0, 20).map((a) => `<li><time>${a.time}</time><strong>${a.type}</strong> · ${a.who} (${a.company})<br>${a.note}</li>`).join('');
    },

    addQuickActivity() {
      const cid = document.getElementById('qaContact')?.value;
      const typ = document.getElementById('qaType')?.value;
      const note = document.getElementById('qaNote')?.value?.trim();
      if (!cid || !typ || !note) return;
      const list = App.contacts();
      const i = list.findIndex((x) => x.id === cid);
      if (i < 0) return;
      list[i].activities.unshift({ time: F.now(), type: typ, note });
      App.setContacts(list);
      App.renderActivityFeed();
      document.getElementById('qaNote').value = '';
    },

    renderQAOptions() {
      const sel = document.getElementById('qaContact');
      if (!sel) return;
      sel.innerHTML = App.contacts().map((c) => `<option value="${c.id}">${c.name} · ${c.company}</option>`).join('');
    },

    renderTasks() {
      const tb = document.getElementById('taskBody');
      if (!tb) return;
      tb.innerHTML = App.tasks().map((t) => `<tr><td>${t.id}</td><td>${t.title}</td><td>${t.owner}</td><td>${t.due}</td><td>${t.status}</td></tr>`).join('');
    },

    addTask() {
      const title = document.getElementById('taskTitle')?.value?.trim();
      const owner = document.getElementById('taskOwner')?.value?.trim();
      const due = document.getElementById('taskDue')?.value;
      if (!title || !owner || !due) return;
      const t = App.tasks();
      t.unshift({ id: `T-${Math.floor(Math.random()*900+100)}`, title, owner, due, status: 'Open' });
      App.setTasks(t);
      App.renderTasks();
      App.renderOverview();
      document.getElementById('taskTitle').value = '';
    },

    renderKanban() {
      const root = document.getElementById('kanban');
      if (!root) return;
      const deals = App.deals();
      const stages = ['Discovery', 'Proposal', 'Negotiation', 'Closed Won'];
      root.innerHTML = stages.map((s) => `<div class="kanban-col" data-stage="${s}"><h4>${s}</h4>${deals.filter((d) => d.stage === s).map((d) => `<div draggable="true" class="kanban-item" data-id="${d.id}"><strong>${d.company}</strong><div class="subtle">${F.money(d.value)} · ${d.owner}</div></div>`).join('')}</div>`).join('');
      root.querySelectorAll('.kanban-item').forEach((el) => {
        el.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', el.dataset.id));
      });
      root.querySelectorAll('.kanban-col').forEach((col) => {
        col.addEventListener('dragover', (e) => e.preventDefault());
        col.addEventListener('drop', (e) => {
          e.preventDefault();
          const id = e.dataTransfer.getData('text/plain');
          const stage = col.dataset.stage;
          const ds = App.deals();
          const i = ds.findIndex((d) => d.id === id);
          if (i >= 0) {
            ds[i].stage = stage;
            App.setDeals(ds);
            App.renderKanban();
            App.renderDealForecast();
          }
        });
      });
    },

    renderDealForecast() {
      const el = document.getElementById('dealForecast');
      if (!el) return;
      const ds = App.deals();
      const win = ds.filter((d) => d.stage === 'Closed Won').reduce((a, d) => a + d.value, 0);
      const active = ds.filter((d) => d.stage !== 'Closed Won').reduce((a, d) => a + d.value, 0);
      el.innerHTML = `<div class="progress"><span style="width:${Math.min(100, (win/(win+active||1))*100)}%"></span></div><p class="subtle">Won ${F.money(win)} | Active ${F.money(active)}</p>`;
    },

    initWizard() {
      const w = document.getElementById('wizard');
      if (!w) return;
      const cfg = F.get(K.PLAYBOOK, SEED.playbook);
      document.getElementById('cfgAudience').value = cfg.audience;
      document.getElementById('cfgMode').value = cfg.mode;
      document.getElementById('cfgReadiness').value = cfg.readiness;
      document.querySelectorAll('input[name="focus"]').forEach((cb) => cb.checked = cfg.focus.includes(cb.value));
      App.showStep(1);
      App.renderConfigSummary();
      document.getElementById('prevStep').onclick = () => App.showStep(App.wizardStep - 1);
      document.getElementById('nextStep').onclick = () => App.showStep(App.wizardStep + 1);
      document.getElementById('saveConfig').onclick = () => {
        const next = {
          audience: document.getElementById('cfgAudience').value,
          mode: document.getElementById('cfgMode').value,
          readiness: document.getElementById('cfgReadiness').value,
          focus: Array.from(document.querySelectorAll('input[name="focus"]:checked')).map((n) => n.value),
          finalizedAt: F.now()
        };
        F.set(K.PLAYBOOK, next);
        App.renderConfigSummary();
      };
    },

    showStep(n) {
      App.wizardStep = Math.max(1, Math.min(3, n));
      document.querySelectorAll('[data-step]').forEach((s) => s.classList.add('hidden'));
      document.querySelector(`[data-step="${App.wizardStep}"]`)?.classList.remove('hidden');
      const lbl = document.getElementById('stepLabel');
      if (lbl) lbl.textContent = `Step ${App.wizardStep} of 3`;
    },

    renderConfigSummary() {
      const el = document.getElementById('configSummary');
      if (!el) return;
      const c = F.get(K.PLAYBOOK, SEED.playbook);
      el.innerHTML = `<strong>${c.audience}</strong> · ${c.mode} · Focus ${c.focus.join(', ')} · ${c.readiness}${c.finalizedAt ? ` · Saved ${c.finalizedAt}` : ''}`;
    },

    initCommandPalette() {
      const cp = document.getElementById('commandPalette');
      if (!cp) return;
      const input = document.getElementById('commandInput');
      const list = document.getElementById('commandList');
      const cmds = [
        { key: 'open contacts', run: () => location.href = 'index.html' },
        { key: 'open pipeline', run: () => location.href = 'pipeline.html' },
        { key: 'open activity', run: () => location.href = 'activity.html' },
        { key: 'open insights', run: () => location.href = 'insights.html' },
        { key: 'toggle theme', run: () => document.getElementById('themeToggle')?.click() }
      ];
      const draw = (q='') => {
        const hit = cmds.filter((c) => c.key.includes(q.toLowerCase()));
        list.innerHTML = hit.map((c, i) => `<div class="kanban-item" data-idx="${i}">${c.key}</div>`).join('');
        list.querySelectorAll('[data-idx]').forEach((el) => el.onclick = () => { hit[Number(el.dataset.idx)].run(); cp.classList.remove('open'); });
      };
      draw();
      window.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cp.classList.toggle('open'); input.focus(); }
        if (e.key === 'Escape') cp.classList.remove('open');
      });
      input.oninput = () => draw(input.value);
    },

    init() {
      seed();
      App.initTheme();
      App.renderOverview();
      App.renderContacts();
      App.renderTable();
      App.renderActivityFeed();
      App.renderTasks();
      App.renderQAOptions();
      App.renderKanban();
      App.renderDealForecast();
      App.initWizard();
      App.initCommandPalette();

      document.getElementById('closeDrawer')?.addEventListener('click', () => document.getElementById('foeDrawer')?.classList.remove('open'));
      document.getElementById('saveEditBtn')?.addEventListener('click', App.saveEdit);
      document.getElementById('closeEditBtn')?.addEventListener('click', () => document.getElementById('editModal')?.classList.remove('open'));
      document.getElementById('taskAddBtn')?.addEventListener('click', App.addTask);
      document.getElementById('qaAddBtn')?.addEventListener('click', App.addQuickActivity);
    }
  };

  window.VeloraPlayground = App;
  document.addEventListener('DOMContentLoaded', App.init);
})();
