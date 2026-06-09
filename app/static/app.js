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
  const list = document.getElementById('project-list');
  try {
    const projects = await fetchJSON('/api/projects/');
    list.innerHTML = '';
    projects.forEach(p => {
      const d = document.createElement('div'); d.className = 'item';
      const header = document.createElement('div'); header.innerHTML = `<strong>${p.code}</strong> — ${p.name}`;
      const descr = document.createElement('div'); descr.className = 'muted'; descr.textContent = p.descr || '';
      const actions = document.createElement('div'); actions.className = 'actions';
      const view = document.createElement('button'); view.textContent = 'View';
      view.onclick = () => { window.location.href = '/project/view/' + p.id; };
      const edit = document.createElement('button'); edit.textContent = 'Edit';
      edit.onclick = () => { window.location.href = '/project/edit/' + p.id; };
      const del = document.createElement('button'); del.textContent = 'Delete';
      del.onclick = async () => {
        if (!confirm('Delete project "' + p.name + '"?')) return;
        try {
          await fetchJSON('/api/projects/' + p.id, { method: 'DELETE' });
          showToast('Project deleted');
          const detail = document.getElementById('project-detail-content');
          if(detail && detail.dataset && +detail.dataset.id === p.id) detail.innerHTML = 'Select a project to see details.';
          await refreshProjects();
        } catch (err) { showToast('Delete failed: ' + err.message, 'error'); }
      };
      actions.appendChild(view); actions.appendChild(edit); actions.appendChild(del);
      d.appendChild(header); d.appendChild(descr); d.appendChild(actions);
      list.appendChild(d);
    });
  } catch (err) {
    list.textContent = 'Error: ' + err.message;
  }
}

async function initProjects() {
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
      form.reset();
      showToast('Project added');
      await refreshProjects();
    } catch (err) { showToast('Create failed: ' + err.message, 'error'); }
    finally { submitBtn.disabled = false; }
  };
  await refreshProjects();
}

async function showProjectDetails(id, editable=false){
  const dst = document.getElementById('project-detail-content');
  try{
    const p = await fetchJSON('/api/projects/' + id);
    dst.dataset.id = p.id;
    if(!editable){
      dst.innerHTML = `<div><strong>${p.code}</strong> — ${p.name}</div><div class="muted">${p.descr || ''}</div>`;
      const editBtn = document.createElement('button'); editBtn.textContent = 'Edit'; editBtn.onclick = () => showProjectDetails(id, true);
      const close = document.createElement('button'); close.textContent = 'Close'; close.onclick = () => { dst.innerHTML = 'Select a project to see details.'; delete dst.dataset.id; };
      dst.appendChild(editBtn); dst.appendChild(close);
    } else {
      dst.innerHTML = '';
      const form = document.createElement('form');
      const codeIn = document.createElement('input'); codeIn.value = p.code; codeIn.maxLength = 5; codeIn.required = true;
      const nameIn = document.createElement('input'); nameIn.value = p.name; nameIn.maxLength = 100; nameIn.required = true;
      const descrIn = document.createElement('textarea'); descrIn.value = p.descr || '';
      const save = document.createElement('button'); save.textContent = 'Save';
      const cancel = document.createElement('button'); cancel.textContent = 'Cancel';
      cancel.type = 'button'; cancel.onclick = () => showProjectDetails(id, false);
      form.appendChild(document.createTextNode('Code:')); form.appendChild(codeIn);
      form.appendChild(document.createElement('br'));
      form.appendChild(document.createTextNode('Name:')); form.appendChild(nameIn);
      form.appendChild(document.createElement('br'));
      form.appendChild(document.createTextNode('Description:')); form.appendChild(descrIn);
      form.appendChild(document.createElement('br'));
      form.appendChild(save); form.appendChild(cancel);
      form.onsubmit = async (e) => {
        e.preventDefault();
        if (!codeIn.value.trim() || !nameIn.value.trim()) return showToast('Code and name required', 'error');
        try{
          save.disabled = true;
          await fetchJSON('/api/projects/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code: codeIn.value.trim(), name: nameIn.value.trim() }) });
          showToast('Project updated');
          await refreshProjects();
          showProjectDetails(id, false);
        } catch (err){ showToast('Update failed: ' + err.message, 'error'); }
        finally{ save.disabled = false; }
      };
      dst.appendChild(form);
    }
  } catch (err){ showToast('Load failed: ' + err.message, 'error'); }
}

// Candidates
async function refreshCandidates() {
  const list = document.getElementById('candidate-list');
  try {
    const items = await fetchJSON('/api/candidates/');
    list.innerHTML = '';
    items.forEach(p => {
      const d = document.createElement('div'); d.className = 'item';
      const header = document.createElement('div'); header.innerHTML = `<strong>${p.id}</strong> — ${p.name}`;
      const actions = document.createElement('div'); actions.className = 'actions';
      const view = document.createElement('button'); view.textContent = 'View'; view.onclick = () => { window.location.href = '/candidate/view/' + p.id; };
      const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.onclick = () => { window.location.href = '/candidate/edit/' + p.id; };
      const del = document.createElement('button'); del.textContent = 'Delete';
      del.onclick = async () => {
        if (!confirm('Delete candidate "' + p.name + '"?')) return;
        try{
          await fetchJSON('/api/candidates/' + p.id, { method: 'DELETE' });
          showToast('Candidate deleted');
          const detail = document.getElementById('candidate-detail-content');
          if(detail && detail.dataset && +detail.dataset.id === p.id) detail.innerHTML = 'Select a candidate to see details.';
          await refreshCandidates();
        } catch (err){ showToast('Delete failed: ' + err.message, 'error'); }
      };
      actions.appendChild(view); actions.appendChild(edit); actions.appendChild(del);
      d.appendChild(header); d.appendChild(actions); list.appendChild(d);
    });
  } catch (err) {
    list.textContent = 'Error: ' + err.message;
  }
}

async function initCandidates() {
  const form = document.getElementById('candidate-form');
  if (!form) return;
  const submitBtn = document.getElementById('candidate-submit');
  form.onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('c_name').value.trim();
    if (!name) return showToast('Name is required', 'error');
    try{ submitBtn.disabled = true; await fetchJSON('/api/candidates/', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) }); form.reset(); showToast('Candidate added'); await refreshCandidates(); }
    catch(err){ showToast('Create failed: ' + err.message, 'error'); }
    finally{ submitBtn.disabled = false; }
  };
  await refreshCandidates();
}

async function showCandidateDetails(id, editable=false){
  const dst = document.getElementById('candidate-detail-content');
  try{
    const p = await fetchJSON('/api/candidates/' + id);
    dst.dataset.id = p.id;
    if(!editable){
      dst.innerHTML = `<div><strong>${p.id}</strong> — ${p.name}</div>`;
      const editBtn = document.createElement('button'); editBtn.textContent = 'Edit'; editBtn.onclick = () => showCandidateDetails(id, true);
      const close = document.createElement('button'); close.textContent = 'Close'; close.onclick = () => { dst.innerHTML = 'Select a candidate to see details.'; delete dst.dataset.id; };
      dst.appendChild(editBtn); dst.appendChild(close);
    } else {
      dst.innerHTML = '';
      const form = document.createElement('form');
      const nameIn = document.createElement('input'); nameIn.value = p.name; nameIn.maxLength = 100; nameIn.required = true;
      const save = document.createElement('button'); save.textContent = 'Save';
      const cancel = document.createElement('button'); cancel.textContent = 'Cancel'; cancel.type = 'button'; cancel.onclick = () => showCandidateDetails(id, false);
      form.appendChild(document.createTextNode('Name:')); form.appendChild(nameIn);
      form.appendChild(document.createElement('br'));
      form.appendChild(save); form.appendChild(cancel);
      form.onsubmit = async (e) => { e.preventDefault(); if (!nameIn.value.trim()) return showToast('Name required', 'error'); try{ save.disabled = true; await fetchJSON('/api/candidates/' + id, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: nameIn.value.trim() }) }); showToast('Candidate updated'); await refreshCandidates(); showCandidateDetails(id, false); } catch(err){ showToast('Update failed: ' + err.message, 'error'); } finally{ save.disabled = false; } };
      dst.appendChild(form);
    }
  } catch (err){ showToast('Load failed: ' + err.message, 'error'); }
}

window.initProjects = initProjects;
window.initCandidates = initCandidates;
