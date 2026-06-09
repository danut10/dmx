async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || res.statusText);
  }
  return res.json();
}

function el(tag, text) { const e = document.createElement(tag); if (text) e.textContent = text; return e; }

function showToast(msg, type=''){
  const t = document.getElementById('toast');
  if(!t) return;
  t.textContent = msg;
  t.className = 'toast ' + type;
  t.style.display = 'block';
  clearTimeout(t._timeout);
  t._timeout = setTimeout(()=>{ t.style.display = 'none'; }, 3500);
}

async function refreshProjects() {
  const tbody = document.getElementById('project-list');
  if (!tbody) return;
  try {
    const projects = await fetchJSON('/api/projects/');
    tbody.innerHTML = '';
    projects.forEach(p => {
      const tr = document.createElement('tr');
      const tdCode = document.createElement('td'); tdCode.textContent = p.code;
      const tdName = document.createElement('td'); tdName.textContent = p.name;
      const tdDescr = document.createElement('td'); tdDescr.className = 'muted'; tdDescr.textContent = p.descr || '';
      const tdActions = document.createElement('td'); tdActions.className = 'actions';
      const view = document.createElement('button'); view.textContent = 'View'; view.className = 'btn btn-sm btn-outline-primary me-1';
      view.onclick = () => { window.location.href = '/project/view/' + p.id; };
      const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.className = 'btn btn-sm btn-outline-secondary me-1';
      edit.onclick = () => { window.location.href = '/project/edit/' + p.id; };
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'btn btn-sm btn-danger';
      del.onclick = async () => {
        if (!confirm('Delete project "' + p.name + '"?')) return;
        try {
          await fetchJSON('/api/projects/' + p.id, { method: 'DELETE' });
          showToast('Project deleted');
          await refreshProjects();
        } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
      };
      tdActions.appendChild(view); tdActions.appendChild(edit); tdActions.appendChild(del);
      tr.appendChild(tdCode); tr.appendChild(tdName); tr.appendChild(tdDescr); tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4">Error: ${err.message}</td></tr>`;
  }
}

async function initProjects() {
  // Always refresh the projects list (works on list page and add page).
  await refreshProjects();

  // If there's an add form on the page, wire it up.
  const form = document.getElementById('project-form');
  if (!form) return;
  const submitBtn = document.getElementById('project-submit');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const code = document.getElementById('code').value.trim();
    const name = document.getElementById('name').value.trim();
    const descr = document.getElementById('descr').value.trim();
    if (!code || code.length > 5) return showToast('Code is required (max 5 chars)', 'error');
    if (!name) return showToast('Name is required', 'error');
    try {
      submitBtn.disabled = true;
      await fetchJSON('/api/projects/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code, name, descr }) });
      // If we're on the separate add page, redirect back to list
      if (window.location.pathname === '/project/add') {
        window.location.href = '/projects';
        return;
      }
      form.reset();
      showToast('Project added');
      if (document.getElementById('project-list')) await refreshProjects();
    } catch (err) { showToast('Create failed: ' + err.message, 'error'); }
    finally { submitBtn.disabled = false; }
  };
}

async function showProjectDetails(id, editable=false){
  // Detail panel removed — navigation to separate pages is used instead.
}

// Candidates
async function refreshCandidates() {
  const tbody = document.getElementById('candidate-list');
  if (!tbody) return;
  try {
    const items = await fetchJSON('/api/candidates/');
    tbody.innerHTML = '';
    items.forEach(p => {
      const tr = document.createElement('tr');
      const tdId = document.createElement('td'); tdId.textContent = p.id;
      const tdName = document.createElement('td'); tdName.textContent = p.name;
      const tdActions = document.createElement('td'); tdActions.className = 'actions';
      const view = document.createElement('button'); view.textContent = 'View'; view.className = 'btn btn-sm btn-outline-primary me-1'; view.onclick = () => { window.location.href = '/candidate/view/' + p.id; };
      const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.className = 'btn btn-sm btn-outline-secondary me-1'; edit.onclick = () => { window.location.href = '/candidate/edit/' + p.id; };
      const del = document.createElement('button'); del.textContent = 'Delete'; del.className = 'btn btn-sm btn-danger';
      del.onclick = async () => {
        if (!confirm('Delete candidate "' + p.name + '"?')) return;
        try{
          await fetchJSON('/api/candidates/' + p.id, { method: 'DELETE' });
          showToast('Candidate deleted');
          await refreshCandidates();
        } catch (err){ showToast('Delete failed: ' + err.message, 'error'); }
      };
      tdActions.appendChild(view); tdActions.appendChild(edit); tdActions.appendChild(del);
      tr.appendChild(tdId); tr.appendChild(tdName); tr.appendChild(tdActions);
      tbody.appendChild(tr);
    });
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="3">Error: ${err.message}</td></tr>`;
  }
}

async function initCandidates() {
  // Always refresh the candidates list (works on list page and add page).
  await refreshCandidates();

  // If there's an add form on the page, wire it up.
  const form = document.getElementById('candidate-form');
  if (!form) return;
  const submitBtn = document.getElementById('candidate-submit');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('c_name').value.trim();
    if (!name) return showToast('Name is required', 'error');
    try{ submitBtn.disabled = true; await fetchJSON('/api/candidates/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
        if (window.location.pathname === '/candidate/add') { window.location.href = '/candidates'; return; }
        form.reset(); showToast('Candidate added'); if (document.getElementById('candidate-list')) await refreshCandidates(); }
      catch(err){ showToast('Create failed: ' + err.message, 'error'); }
      finally{ submitBtn.disabled = false; }
  };
}

async function showCandidateDetails(id, editable=false){
  // Detail panel removed — navigation to separate pages is used instead.
}

window.initProjects = initProjects;
window.initCandidates = initCandidates;
