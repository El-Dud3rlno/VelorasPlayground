(function () {
  const THEME_KEY = 'crm_theme';
  const CONTACT_KEY = 'crm_contacts_seeded';

  const CONTACTS = [
    {
      id: 'C-1001',
      name: 'Mara Ellison',
      company: 'Northline Freight',
      segment: 'Enterprise Logistics',
      owner: 'Ari Chen',
      stage: 'Expansion',
      health: 'Strong',
      arr: '$124,000',
      poster: 'linear-gradient(135deg,#0f172a,#334155,#e50914)',
      activities: [
        { time: '2026-02-19 10:40', type: 'Call', note: 'Reviewed Q2 rollout plan and adoption targets.' },
        { time: '2026-02-16 09:10', type: 'Email', note: 'Sent onboarding checklist and stakeholder map.' },
        { time: '2026-02-09 15:00', type: 'Meeting', note: 'Security review complete. Procurement approved.' }
      ]
    },
    {
      id: 'C-1002',
      name: 'Jonah Reyes',
      company: 'Crestpoint Health',
      segment: 'Mid-Market Healthcare',
      owner: 'Nia Patel',
      stage: 'Pilot',
      health: 'At Risk',
      arr: '$58,000',
      poster: 'linear-gradient(135deg,#312e81,#1f2937,#dc2626)',
      activities: [
        { time: '2026-02-18 14:20', type: 'Task', note: 'FOE activity records requested for compliance committee.' },
        { time: '2026-02-12 11:00', type: 'Call', note: 'Addressed concerns around data migration timeline.' },
        { time: '2026-02-07 16:30', type: 'Email', note: 'Shared pilot KPI dashboard and escalation path.' }
      ]
    },
    {
      id: 'C-1003',
      name: 'Priya Nambiar',
      company: 'Aster Retail Group',
      segment: 'Enterprise Retail',
      owner: 'Leo Kim',
      stage: 'Renewal',
      health: 'Watch',
      arr: '$91,500',
      poster: 'linear-gradient(135deg,#111827,#374151,#b91c1c)',
      activities: [
        { time: '2026-02-20 08:45', type: 'Meeting', note: 'Presented ROI summary and cross-region benchmark.' },
        { time: '2026-02-13 13:30', type: 'Call', note: 'Resolved contract redlines with legal team.' },
        { time: '2026-02-03 10:00', type: 'Task', note: 'Queued renewal motion in weekly exec review.' }
      ]
    },
    {
      id: 'C-1004',
      name: 'Darren Cole',
      company: 'Pioneer Public Services',
      segment: 'Public Sector',
      owner: 'Mina Sol',
      stage: 'Onboarding',
      health: 'Strong',
      arr: '$47,200',
      poster: 'linear-gradient(135deg,#1e293b,#0f766e,#ef4444)',
      activities: [
        { time: '2026-02-21 09:25', type: 'Email', note: 'Confirmed stakeholder training schedule.' },
        { time: '2026-02-15 12:10', type: 'Task', note: 'Imported contact hierarchy and support tiers.' },
        { time: '2026-02-10 17:45', type: 'Call', note: 'Validated success criteria for first 60 days.' }
      ]
    }
  ];

  function saveSeed() {
    if (!localStorage.getItem(CONTACT_KEY)) {
      localStorage.setItem(CONTACT_KEY, 'true');
      localStorage.setItem('crm_contacts', JSON.stringify(CONTACTS));
    }
  }
  function getContacts() {
    return JSON.parse(localStorage.getItem('crm_contacts') || '[]');
  }

  const App = {
    setTheme(next) {
      localStorage.setItem(THEME_KEY, next);
      document.documentElement.setAttribute('data-theme', next);
    },
    initTheme() {
      const stored = localStorage.getItem(THEME_KEY) || 'dark';
      document.documentElement.setAttribute('data-theme', stored);
      const btn = document.getElementById('themeToggle');
      if (btn) {
        btn.textContent = stored === 'dark' ? 'Light mode' : 'Dark mode';
        btn.onclick = () => {
          const now = document.documentElement.getAttribute('data-theme') || 'dark';
          const next = now === 'dark' ? 'light' : 'dark';
          App.setTheme(next);
          btn.textContent = next === 'dark' ? 'Light mode' : 'Dark mode';
        };
      }
    },
    renderContacts() {
      const rail = document.getElementById('contactRail');
      const search = document.getElementById('contactSearch');
      if (!rail) return;
      const contacts = getContacts();

      function draw(list) {
        rail.innerHTML = list.map((c) => `
          <article class="contact-card" data-id="${c.id}">
            <div class="poster" style="background:${c.poster}">
              <small>${c.segment}</small>
              <strong>${c.company}</strong>
            </div>
            <div class="card-meta">
              <div><strong>${c.name}</strong></div>
              <div style="margin:.35rem 0;color:var(--muted)">${c.stage} · ${c.arr}</div>
              <span class="chip">${c.health}</span>
            </div>
          </article>`).join('');
        rail.querySelectorAll('.contact-card').forEach((card) => {
          card.onclick = () => App.openFoeRecord(card.getAttribute('data-id'));
        });
      }

      draw(contacts);
      if (search) {
        search.oninput = (e) => {
          const q = e.target.value.toLowerCase();
          draw(contacts.filter((c) => JSON.stringify(c).toLowerCase().includes(q)));
        };
      }
    },
    openFoeRecord(id) {
      const contact = getContacts().find((c) => c.id === id);
      const drawer = document.getElementById('foeDrawer');
      const body = document.getElementById('foeBody');
      if (!drawer || !body || !contact) return;
      body.innerHTML = `
        <h2 style="margin:0 0 .2rem">${contact.name}</h2>
        <p style="margin:0;color:var(--muted)">${contact.company} · Owner: ${contact.owner}</p>
        <div class="tips"><strong>Tips:</strong> FOE activity records help your audience see account momentum quickly in demos.</div>
        <h3 style="margin:.5rem 0">FOE Activity Records</h3>
        <ul class="timeline">
          ${contact.activities.map((a) => `<li><time>${a.time} · ${a.type}</time><div>${a.note}</div></li>`).join('')}
        </ul>`;
      drawer.classList.add('open');
    },
    closeDrawer() {
      const drawer = document.getElementById('foeDrawer');
      if (drawer) drawer.classList.remove('open');
    },
    renderPipelineTable() {
      const el = document.getElementById('pipelineBody');
      if (!el) return;
      el.innerHTML = getContacts().map((c) => `<tr><td>${c.id}</td><td>${c.name}</td><td>${c.company}</td><td>${c.stage}</td><td>${c.owner}</td><td>${c.health}</td><td>${c.arr}</td></tr>`).join('');
    },
    renderFeed() {
      const el = document.getElementById('activityFeed');
      if (!el) return;
      const items = getContacts().flatMap((c) => c.activities.map((a) => ({ ...a, name: c.name, company: c.company }))).sort((a, b) => b.time.localeCompare(a.time));
      el.innerHTML = items.slice(0, 12).map((a) => `<li><time>${a.time}</time><strong>${a.type}</strong> · ${a.name} (${a.company})<br>${a.note}</li>`).join('');
    }
  };

  window.VeloraPlayground = App;
  document.addEventListener('DOMContentLoaded', () => {
    saveSeed();
    App.initTheme();
    App.renderContacts();
    App.renderPipelineTable();
    App.renderFeed();
    const close = document.getElementById('closeDrawer');
    if (close) close.onclick = App.closeDrawer;
  });
})();
