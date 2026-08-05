/* Admin CMS — talks directly to the GitHub Contents API from this browser tab.
   Owner/repo/branch persist in localStorage (not sensitive). The token lives
   only in sessionStorage: never written to a file, never sent anywhere but
   api.github.com, and gone as soon as this tab closes. */

function b64EncodeUnicode(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

function b64DecodeUnicode(str) {
  const binary = atob(str);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function getConfig() {
  return {
    owner: localStorage.getItem('admin_owner') || '',
    repo: localStorage.getItem('admin_repo') || '',
    branch: localStorage.getItem('admin_branch') || 'main',
    token: sessionStorage.getItem('admin_token') || '',
  };
}

async function ghApi(url, method = 'GET', body = null) {
  const { token } = getConfig();
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res;
}

/** Returns an array for a directory, {sha, content} for a file, or null on 404. */
async function ghGetFile(path) {
  const { owner, repo, branch } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(branch)}`;
  const res = await ghApi(url);
  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GET ${path} failed (${res.status})`);
  }
  const data = await res.json();
  if (Array.isArray(data)) return data;
  return { sha: data.sha, content: b64DecodeUnicode(data.content.replace(/\n/g, '')) };
}

async function ghPutFile(path, content, message, sha) {
  const { owner, repo, branch } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodePath(path)}`;
  const body = { message, content: b64EncodeUnicode(content), branch };
  if (sha) body.sha = sha;
  const res = await ghApi(url, 'PUT', body);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `PUT ${path} failed (${res.status})`);
  }
  return res.json();
}

async function ghDeleteFile(path, message, sha) {
  const { owner, repo, branch } = getConfig();
  const url = `https://api.github.com/repos/${owner}/${repo}/contents/${encodePath(path)}`;
  const res = await ghApi(url, 'DELETE', { message, sha, branch });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `DELETE ${path} failed (${res.status})`);
  }
  return res.json();
}

function slugify(s) {
  return String(s).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'untitled';
}

function cleanTags(csv) {
  return String(csv || '').split(',').map(t => t.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
}

function yamlStr(s) {
  return `"${String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function pad2(n) { return String(n).padStart(2, '0'); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function nowStamp() {
  const d = new Date();
  return `${todayISO()} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
}

function setStatus(key, msg, isError = false) {
  const el = document.querySelector(`[data-status="${key}"]`);
  if (!el) return;
  el.textContent = msg;
  el.style.color = isError ? '#ffc4cb' : '';
}

document.addEventListener('DOMContentLoaded', () => {
  const els = {
    connectView: document.getElementById('connect-view'),
    adminView: document.getElementById('admin-view'),
    owner: document.getElementById('cfg-owner'),
    repo: document.getElementById('cfg-repo'),
    branch: document.getElementById('cfg-branch'),
    token: document.getElementById('cfg-token'),
    connectStatus: document.getElementById('connect-status'),
    whoami: document.getElementById('whoami-line'),
  };

  function showAdmin(owner, repo, branch) {
    els.whoami.textContent = `${owner}/${repo}@${branch}`;
    els.connectView.style.display = 'none';
    els.adminView.style.display = 'block';
  }

  // Restore prior owner/repo/branch (not sensitive) and auto-connect if a
  // token is still alive in this tab's session.
  const cfg = getConfig();
  if (cfg.owner) els.owner.value = cfg.owner;
  if (cfg.repo) els.repo.value = cfg.repo;
  if (cfg.branch) els.branch.value = cfg.branch;
  if (cfg.owner && cfg.repo && cfg.token) showAdmin(cfg.owner, cfg.repo, cfg.branch);

  document.getElementById('connect-btn').addEventListener('click', async () => {
    const owner = els.owner.value.trim();
    const repo = els.repo.value.trim();
    const branch = els.branch.value.trim() || 'main';
    const token = els.token.value.trim();
    if (!owner || !repo || !token) {
      els.connectStatus.textContent = 'Fill in username, repo, and token.';
      return;
    }
    els.connectStatus.textContent = 'Checking access…';
    try {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' },
      });
      if (!res.ok) throw new Error(`Could not access ${owner}/${repo} (HTTP ${res.status}). Check the token's repository access and permissions.`);
      localStorage.setItem('admin_owner', owner);
      localStorage.setItem('admin_repo', repo);
      localStorage.setItem('admin_branch', branch);
      sessionStorage.setItem('admin_token', token);
      els.connectStatus.textContent = '';
      showAdmin(owner, repo, branch);
    } catch (e) {
      els.connectStatus.textContent = '✗ ' + e.message;
    }
  });

  document.getElementById('disconnect-btn').addEventListener('click', () => {
    sessionStorage.removeItem('admin_token');
    els.token.value = '';
    els.adminView.style.display = 'none';
    els.connectView.style.display = 'block';
  });

  // Tab switching
  document.querySelectorAll('.admin-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.admin-tabs button').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-panel-view').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.view).classList.add('active');
    });
  });

  function val(id) { return document.getElementById(id).value; }
  function clearFields(ids) { ids.forEach(id => { document.getElementById(id).value = ''; }); }

  // ---- New Blog Post ----
  document.querySelector('[data-action="save-blog"]').addEventListener('click', async () => {
    const title = val('blog-title').trim();
    if (!title) return setStatus('blog', 'Title is required.', true);
    const tags = cleanTags(val('blog-tags'));
    const excerpt = val('blog-excerpt').trim();
    const body = val('blog-body');
    const path = `_posts/${todayISO()}-${slugify(title)}.md`;
    const front = ['---',
      `title: ${yamlStr(title)}`,
      `date: ${nowStamp()} +0500`,
      'category: blog',
      `tags: [${tags.join(', ')}]`,
      excerpt ? `excerpt: ${yamlStr(excerpt)}` : null,
      '---', ''].filter(Boolean).join('\n');
    setStatus('blog', 'Publishing…');
    try {
      await ghPutFile(path, front + body + '\n', `Add blog post: ${title}`);
      setStatus('blog', `✓ Published ${path} — live after the next Pages build (~1 min).`);
      clearFields(['blog-title', 'blog-tags', 'blog-excerpt', 'blog-body']);
    } catch (e) { setStatus('blog', '✗ ' + e.message, true); }
  });

  // ---- New Lab Writeup ----
  document.querySelector('[data-action="save-lab"]').addEventListener('click', async () => {
    const title = val('lab-title').trim();
    if (!title) return setStatus('lab', 'Title is required.', true);
    const platform = val('lab-platform');
    const platformLabel = platform === 'htb' ? 'HackTheBox' : 'TryHackMe';
    const difficulty = val('lab-difficulty');
    const tags = cleanTags(val('lab-tags'));
    const body = val('lab-body');
    const path = `_posts/${todayISO()}-${platform}-${slugify(title)}.md`;
    const front = ['---',
      `title: ${yamlStr(title)}`,
      `date: ${nowStamp()} +0500`,
      `category: ${platform}`,
      `platform: ${yamlStr(platformLabel)}`,
      difficulty ? `difficulty: ${yamlStr(difficulty)}` : null,
      `tags: [${tags.join(', ')}]`,
      '---', ''].filter(Boolean).join('\n');
    setStatus('lab', 'Publishing…');
    try {
      await ghPutFile(path, front + body + '\n', `Add ${platformLabel} writeup: ${title}`);
      setStatus('lab', `✓ Published ${path}.`);
      clearFields(['lab-title', 'lab-tags', 'lab-body']);
    } catch (e) { setStatus('lab', '✗ ' + e.message, true); }
  });

  // ---- New Video ----
  document.querySelector('[data-action="save-video"]').addEventListener('click', async () => {
    const title = val('video-title').trim();
    if (!title) return setStatus('video', 'Title is required.', true);
    const yt = val('video-yt').trim();
    const tags = cleanTags(val('video-tags'));
    const desc = val('video-desc').trim();
    const body = val('video-body');
    const path = `_videos/${slugify(title)}.md`;
    const front = ['---',
      `title: ${yamlStr(title)}`,
      `date: ${todayISO()}`,
      `youtube_id: ${yamlStr(yt)}`,
      `tags: [${tags.join(', ')}]`,
      desc ? `description: ${yamlStr(desc)}` : null,
      '---', ''].filter(Boolean).join('\n');
    setStatus('video', 'Saving…');
    try {
      await ghPutFile(path, front + body + '\n', `Add video: ${title}`);
      setStatus('video', `✓ Saved ${path}.${yt ? '' : ' Come back and set youtube_id once it\'s uploaded.'}`);
      clearFields(['video-title', 'video-yt', 'video-tags', 'video-desc', 'video-body']);
    } catch (e) { setStatus('video', '✗ ' + e.message, true); }
  });

  // ---- Edit Skills ----
  document.querySelector('[data-action="load-skills"]').addEventListener('click', async () => {
    setStatus('skills', 'Loading…');
    try {
      const file = await ghGetFile('_data/skills.yml');
      if (!file || Array.isArray(file)) return setStatus('skills', 'File not found.', true);
      const ta = document.getElementById('skills-yaml');
      ta.value = file.content;
      ta.dataset.sha = file.sha;
      setStatus('skills', 'Loaded.');
    } catch (e) { setStatus('skills', '✗ ' + e.message, true); }
  });
  document.querySelector('[data-action="save-skills"]').addEventListener('click', async () => {
    const ta = document.getElementById('skills-yaml');
    if (!ta.value.trim()) return setStatus('skills', 'Load the file first.', true);
    setStatus('skills', 'Saving…');
    try {
      const result = await ghPutFile('_data/skills.yml', ta.value, 'Update skills.yml via admin', ta.dataset.sha || undefined);
      ta.dataset.sha = result.content.sha;
      setStatus('skills', '✓ Saved.');
    } catch (e) { setStatus('skills', '✗ ' + e.message, true); }
  });

  // ---- Browse & Edit Files ----
  async function loadFileIntoEditor(path) {
    setStatus('files', 'Loading ' + path + '…');
    try {
      const file = await ghGetFile(path);
      if (!file || Array.isArray(file)) return setStatus('files', 'Not a file (or it doesn\'t exist yet).', true);
      const ta = document.getElementById('files-content');
      ta.value = file.content;
      ta.dataset.sha = file.sha;
      setStatus('files', 'Loaded ' + path);
    } catch (e) { setStatus('files', '✗ ' + e.message, true); }
  }

  document.querySelector('[data-action="list-files"]').addEventListener('click', async () => {
    const folder = val('files-folder');
    const listEl = document.getElementById('files-list');
    listEl.innerHTML = '';
    setStatus('files', 'Listing…');
    try {
      const items = await ghGetFile(folder);
      if (!Array.isArray(items)) return setStatus('files', 'That path is not a folder.', true);
      items.filter(i => i.type === 'file').forEach(i => {
        const b = document.createElement('button');
        b.type = 'button';
        b.textContent = i.path;
        b.addEventListener('click', () => {
          document.getElementById('files-path').value = i.path;
          loadFileIntoEditor(i.path);
        });
        listEl.appendChild(b);
      });
      setStatus('files', `${items.length} item(s).`);
    } catch (e) { setStatus('files', '✗ ' + e.message, true); }
  });

  document.querySelector('[data-action="load-file"]').addEventListener('click', () => {
    const path = val('files-path').trim();
    if (!path) return setStatus('files', 'Enter a path first.', true);
    loadFileIntoEditor(path);
  });

  document.querySelector('[data-action="save-file"]').addEventListener('click', async () => {
    const path = val('files-path').trim();
    const ta = document.getElementById('files-content');
    if (!path) return setStatus('files', 'Enter a path first.', true);
    setStatus('files', 'Saving…');
    try {
      const result = await ghPutFile(path, ta.value, `Edit ${path} via admin`, ta.dataset.sha || undefined);
      ta.dataset.sha = result.content.sha;
      setStatus('files', '✓ Saved ' + path);
    } catch (e) { setStatus('files', '✗ ' + e.message, true); }
  });

  document.querySelector('[data-action="delete-file"]').addEventListener('click', async () => {
    const path = val('files-path').trim();
    const ta = document.getElementById('files-content');
    if (!path || !ta.dataset.sha) return setStatus('files', 'Load the file first, then delete.', true);
    if (!confirm(`Delete ${path}? This can't be undone from here.`)) return;
    setStatus('files', 'Deleting…');
    try {
      await ghDeleteFile(path, `Delete ${path} via admin`, ta.dataset.sha);
      ta.value = '';
      delete ta.dataset.sha;
      setStatus('files', '✓ Deleted ' + path);
    } catch (e) { setStatus('files', '✗ ' + e.message, true); }
  });
});
