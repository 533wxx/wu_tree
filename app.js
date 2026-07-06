// ===== STATE =====
let currentBranch = 0;
let allPersons = [];

// ===== FLATTEN FOR SEARCH =====
function flattenPerson(person, branch, parentName) {
  allPersons.push({ ...person, branch, parentName });
  if (person.children) {
    person.children.forEach(c => flattenPerson(c, branch, person.name));
  }
}

function buildSearchIndex() {
  allPersons = [];
  familyData.forEach(fd => {
    flattenPerson(fd.root, fd.branch, "");
    if (fd.siblings) fd.siblings.forEach(s => flattenPerson(s, fd.branch, ""));
  });
}

// ===== RENDER SIDEBAR =====
function renderSidebar() {
  const list = document.getElementById('branchList');
  list.innerHTML = '';
  familyData.forEach((fd, i) => {
    let count = 0;
    const countFn = p => { count++; if (p.children) p.children.forEach(countFn); };
    countFn(fd.root);
    if (fd.siblings) fd.siblings.forEach(s => countFn(s));
    const btn = document.createElement('button');
    btn.className = 'branch-btn' + (i === currentBranch ? ' active' : '');
    btn.innerHTML = `<span>${fd.branch}</span><span class="branch-count">${count}人</span>`;
    btn.onclick = () => { currentBranch = i; render(); closeSidebar(); };
    list.appendChild(btn);
  });
}

// ===== RENDER STATS =====
function renderStats() {
  const fd = familyData[currentBranch];
  const seen = new Set();
  let total = 0, maxGen = 0;

  function countPerson(p) {
    // Deduplicate by ID to avoid double-counting adopted children
    if (seen.has(p.id)) return;
    seen.add(p.id);
    total++;
    if (p.gen > maxGen) maxGen = p.gen;
    if (p.children) p.children.forEach(countPerson);
  }

  countPerson(fd.root);
  if (fd.siblings) fd.siblings.forEach(s => countPerson(s));

  document.getElementById('statsBar').innerHTML = `
    <div class="stat-item"><div class="stat-label">房支</div><div class="stat-value">${fd.branch}</div></div>
    <div class="stat-item"><div class="stat-label">总人数</div><div class="stat-value">${total}</div></div>
    <div class="stat-item"><div class="stat-label">世代跨度</div><div class="stat-value">${maxGen}世</div></div>
  `;
}

// ===== RENDER BREADCRUMB =====
function renderBreadcrumb() {
  const fd = familyData[currentBranch];
  document.getElementById('breadcrumb').innerHTML = `
    <span>高橋吳氏</span><span class="sep">›</span>
    <span>卷十三 世系</span><span class="sep">›</span>
    <span class="current">${fd.branch}房</span>
  `;
}

// ===== ACCORDION TOGGLE =====
function toggleChildren(btnEl, personId, childCount) {
  btnEl.stopPropagation();
  // Find the card and its parent row
  const card = btnEl.target.closest('.node-card');
  if (!card) return;
  const row = card.parentElement;
  if (!row) return;

  // Find the children-container right after this card (or nested deeper in wrapper)
  let childContainer = null;
  // Look within the same parent row for the children-container associated with this card
  const allContainers = row.querySelectorAll(':scope > .children-container');
  // The children-container might be in a wrapper div
  const nextWrapper = card.nextElementSibling;
  if (nextWrapper && nextWrapper.querySelector('.children-container')) {
    childContainer = nextWrapper.querySelector('.children-container');
  }
  // Also check direct children-containers
  if (!childContainer) {
    for (const c of row.querySelectorAll('.children-container')) {
      if (c.closest('.node-card') === null || c.closest('.node-card') === card) {
        // Check if this container is directly after this card or in a wrapper
      }
    }
  }

  // Find all children-containers at the same level (same parent row)
  const siblings = [];
  // Direct children of this row
  row.querySelectorAll(':scope > .children-container').forEach(c => siblings.push(c));
  // Children inside wrappers
  row.querySelectorAll(':scope > div > .children-container').forEach(c => siblings.push(c));

  // Also check the global children-row structure
  const allChildRows = row.querySelectorAll('.children-row');
  let targetContainer = null;

  // Find which children-container to toggle by looking at the card's next sibling wrapper
  let wrapper = card.nextElementSibling;
  while (wrapper) {
    const cc = wrapper.querySelector('.children-container');
    if (cc) {
      targetContainer = cc;
      break;
    }
    wrapper = wrapper.nextElementSibling;
  }

  if (!targetContainer) {
    // Fallback: look in all wrappers for the matching container
    const wrappers = row.querySelectorAll(':scope > div');
    for (const w of wrappers) {
      const cc = w.querySelector('.children-container');
      if (cc) { targetContainer = cc; break; }
    }
  }

  const isOpening = targetContainer && !targetContainer.classList.contains('show');

  // Close all children-containers at this level
  row.querySelectorAll('.children-container.show').forEach(c => c.classList.remove('show'));
  row.querySelectorAll('.has-children.open').forEach(b => b.classList.remove('open'));

  // If was closed, open it
  if (isOpening && targetContainer) {
    targetContainer.classList.add('show');
    if (btnEl.target.classList.contains('has-children')) {
      btnEl.target.classList.add('open');
    }
  }
}

// ===== CREATE NODE CARD =====
function createNodeCard(person, delay = 0) {
  const card = document.createElement('div');
  card.className = 'node-card';
  card.style.animationDelay = delay * 0.05 + 's';
  card.dataset.id = person.id;

  let genLabel = person.gen + '世';
  let nameHtml = `<span class="name">${person.name}</span>`;
  if (person.birthOrder) nameHtml += ` <span class="order-badge">${person.birthOrder}</span>`;
  if (person.note === '幼歿') nameHtml += ` <span class="death-badge">幼歿</span>`;

  let ziHtml = '';
  if (person.zi) ziHtml += `字${person.zi}`;
  if (person.hao) ziHtml += ` 号${person.hao}`;

  let detailHtml = '';
  if (person.birthDisplay) detailHtml += `<div>生于 ${person.birthDisplay}</div>`;
  else if (person.birth) detailHtml += `<div>生于 ${person.birth}</div>`;
  if (person.wife) detailHtml += `<div class="highlight">${person.wife}</div>`;
  if (person.adoptNote) detailHtml += `<div class="adopt-badge">${person.adoptNote}</div>`;
  if (person.death) detailHtml += `<div style="color:var(--text-dim)">${person.death}</div>`;

  const childCount = (person.children ? person.children.length : 0);
  let childBtn = '';
  if (childCount > 0) {
    childBtn = `<div class="has-children" data-person-id="${person.id}" data-count="${childCount}">▸ ${childCount} 子嗣展开</div>`;
  }

  card.innerHTML = `
    <div class="card-top">
      ${nameHtml}
      <span class="gen-badge">${genLabel}</span>
    </div>
    ${ziHtml ? `<div class="zi">${ziHtml}</div>` : ''}
    <div class="detail">${detailHtml}</div>
    ${childBtn}
  `;

  // Click on card body opens modal
  card.addEventListener('click', (e) => {
    // Don't open modal if clicking the has-children button
    if (e.target.classList.contains('has-children')) return;
    openModal(person);
  });

  // Click on has-children button toggles children (accordion)
  if (childCount > 0) {
    const btn = card.querySelector('.has-children');
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      e.preventDefault();
      const card = this.closest('.node-card');
      if (!card) return;

      // Find the children-container — it's inside the wrapper div after this card
      let wrapper = card.nextElementSibling;
      let targetContainer = null;
      if (wrapper && wrapper.querySelector('.children-container')) {
        targetContainer = wrapper.querySelector('.children-container');
      }

      if (!targetContainer) return;

      const isOpening = !targetContainer.classList.contains('show');

      // Find parent row — go up from card to the nearest children-row or nodes-row
      let row = card.closest('.children-row') || card.closest('.nodes-row');
      if (!row) return;

      // Close all open children at this level and reset their arrows
      row.querySelectorAll('.children-container.show').forEach(c => c.classList.remove('show'));
      row.querySelectorAll('.has-children.open').forEach(b => {
        b.classList.remove('open');
        b.textContent = '▸ ' + (b.dataset.count || '0') + ' 子嗣展开';
      });

      // If was closed, open it
      if (isOpening) {
        targetContainer.classList.add('show');
        this.classList.add('open');
        this.textContent = '▾ ' + (this.dataset.count || '0') + ' 子嗣收起';
      }
    });
  }

  return card;
}

// ===== RENDER TREE =====
function renderTree() {
  const container = document.getElementById('treeContainer');
  container.innerHTML = '';
  const fd = familyData[currentBranch];
  const allRoots = [fd.root, ...(fd.siblings || [])];

  allRoots.forEach(root => {
    const branchDiv = document.createElement('div');
    branchDiv.className = 'gen-row';

    if (allRoots.length > 1) {
      const label = document.createElement('div');
      label.className = 'gen-label';
      label.innerHTML = `<span>${root.name}</span> · ${root.gen}世${root.zi ? ' · 字' + root.zi : ''}`;
      branchDiv.appendChild(label);
    }

    const row = document.createElement('div');
    row.className = 'nodes-row';
    row.appendChild(createNodeCard(root, 0));

    if (root.children && root.children.length > 0) {
      const wrapper = document.createElement('div');
      const childContainer = document.createElement('div');
      childContainer.className = 'children-container';
      renderChildren(childContainer, root.children, 1);
      wrapper.appendChild(childContainer);
      row.appendChild(wrapper);
    }

    branchDiv.appendChild(row);
    container.appendChild(branchDiv);
  });
}

function renderChildren(container, children, depth) {
  const header = document.createElement('div');
  header.className = 'children-header';
  const gen = children[0] ? children[0].gen : '';
  header.textContent = `${gen}世 · ${children.length}人`;
  container.appendChild(header);

  const row = document.createElement('div');
  row.className = 'children-row';

  children.forEach((child, i) => {
    const card = createNodeCard(child, i + depth * 3);
    row.appendChild(card);

    if (child.children && child.children.length > 0) {
      const wrapper = document.createElement('div');
      const sub = document.createElement('div');
      sub.className = 'children-container';
      // Initially closed — user clicks to expand
      renderChildren(sub, child.children, depth + 1);

      // Also render grandchildren recursively
      wrapper.appendChild(sub);
      row.appendChild(wrapper);
    }
  });

  container.appendChild(row);
}

// ===== MODAL =====
function openModal(person) {
  document.getElementById('modalTitle').textContent = person.name;
  let html = '<div class="modal-section"><div class="modal-section-title">基 本 信 息</div>';
  html += field('世代', person.gen + '世');
  if (person.birthOrder) html += field('排行', person.birthOrder);
  if (person.zi) html += field('字', person.zi);
  if (person.hao) html += field('号', person.hao);
  if (person.birthDisplay) {
    html += field('生于', person.birthDisplay);
  } else if (person.birth) {
    html += field('生于', person.birth);
  }
  if (person.wife) html += field('配偶', person.wife);
  if (person.death) html += field('歿葬', person.death);
  if (person.note) html += field('备注', person.note);
  if (person.adoptNote) html += field('过继', person.adoptNote);
  if (person.daughters && person.daughters.length) html += field('女儿', person.daughters.join('、'));
  html += '</div>';

  if (person.children && person.children.length > 0) {
    html += `<div class="modal-section"><div class="modal-section-title">子 嗣（${person.children.length}人）</div><div class="modal-children-list">`;
    person.children.forEach(c => {
      html += `<div class="modal-child-item" onclick="navigateTo('${c.id}')">
        <span><strong>${c.name}</strong>${c.zi ? ' · 字' + c.zi : ''}${c.note ? ' · ' + c.note : ''}</span>
        <span style="color:var(--text-dim);font-size:12px">${c.gen}世</span></div>`;
    });
    html += '</div></div>';
  }

  document.getElementById('modalBody').innerHTML = html;
  document.getElementById('modalOverlay').classList.add('active');
}

function field(label, value) {
  return `<div class="modal-field"><div class="label">${label}</div><div class="value">${value}</div></div>`;
}

function closeModal() {
  document.getElementById('modalOverlay').classList.remove('active');
}

function navigateTo(id) {
  closeModal();
  // Also expand parent chain to make target visible
  expandToNode(id);
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.style.borderColor = 'var(--accent)';
      el.style.boxShadow = '0 0 20px rgba(200,160,80,0.3)';
      setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 2000);
    }
  }, 200);
}

// Expand all ancestor containers to make a node visible
function expandToNode(id) {
  const target = document.querySelector(`[data-id="${id}"]`);
  if (!target) return;
  let el = target;
  while (el) {
    // Check if el is inside a children-container
    const cc = el.closest('.children-container');
    if (cc && !cc.classList.contains('show')) {
      cc.classList.add('show');
      // Also mark the has-children button as open
      const card = cc.closest('.node-card');
    }
    // Also check parent wrapper
    let parent = el.parentElement;
    while (parent) {
      if (parent.classList.contains('children-container') && !parent.classList.contains('show')) {
        parent.classList.add('show');
      }
      parent = parent.parentElement;
    }
    el = el.parentElement;
  }
}

// ===== SEARCH =====
const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');

searchInput.addEventListener('input', function() {
  const q = this.value.trim();
  if (!q) { searchResults.classList.remove('active'); return; }
  const matches = allPersons.filter(p =>
    p.name.includes(q) || (p.zi && p.zi.includes(q)) || (p.hao && p.hao.includes(q))
  ).slice(0, 20);
  if (matches.length === 0) {
    searchResults.innerHTML = '<div style="padding:12px 16px;color:var(--text-dim);font-size:13px">未找到匹配结果</div>';
  } else {
    searchResults.innerHTML = matches.map(p => `
      <div class="search-result-item" onclick="searchSelect('${p.id}', '${p.branch}')">
        <div><span class="name">${p.name}</span>${p.zi ? ' · 字' + p.zi : ''}${p.hao ? ' · 号' + p.hao : ''}</div>
        <div class="info">${p.branch}房 · ${p.gen}世</div>
      </div>`).join('');
  }
  searchResults.classList.add('active');
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => searchResults.classList.remove('active'), 200);
});

function searchSelect(id, branch) {
  const branchIdx = familyData.findIndex(fd => fd.branch === branch);
  if (branchIdx >= 0 && branchIdx !== currentBranch) {
    currentBranch = branchIdx;
    render();
  }
  searchInput.value = '';
  searchResults.classList.remove('active');
  setTimeout(() => { navigateTo(id); }, 150);
}

document.getElementById('modalOverlay').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

// ===== MOBILE SIDEBAR TOGGLE =====
function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.getElementById('menuBtn');
  const isOpen = sidebar.classList.contains('open');
  if (isOpen) {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
    menuBtn.classList.remove('open');
  } else {
    sidebar.classList.add('open');
    overlay.classList.add('active');
    menuBtn.classList.add('open');
  }
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const overlay = document.getElementById('sidebarOverlay');
  const menuBtn = document.getElementById('menuBtn');
  sidebar.classList.remove('open');
  overlay.classList.remove('active');
  menuBtn.classList.remove('open');
}

// ===== RENDER ALL =====
function render() {
  renderSidebar();
  renderBreadcrumb();
  renderStats();
  renderTree();
  // Re-sync header height after content changes
  setTimeout(syncHeaderHeight, 50);
}

// ===== DYNAMIC HEADER HEIGHT =====
function syncHeaderHeight() {
  const header = document.querySelector('.header');
  const layout = document.querySelector('.layout');
  const sidebar = document.getElementById('sidebar');
  if (!header || !layout) return;
  const h = header.offsetHeight;
  layout.style.paddingTop = h + 'px';
  // Update sidebar height to account for header
  if (sidebar) {
    sidebar.style.height = 'calc(100vh - ' + h + 'px)';
    if (window.innerWidth <= 900) {
      sidebar.style.paddingTop = h + 'px';
    }
  }
}

// ===== INIT =====
buildSearchIndex();
render();
syncHeaderHeight();
window.addEventListener('resize', syncHeaderHeight);
