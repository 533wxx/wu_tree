<template>
  <header class="header">
    <div class="header-inner">
      <div class="title-block">
        <h1 class="title">高橋吳氏宗譜</h1>
        <span class="subtitle">卷十三 · 世系 · 二〇二六年丙午岁重修</span>
      </div>
      <div class="header-actions">
        <button class="menu-btn" :class="{ open: sidebarOpen }" @click="$emit('toggleSidebar')" aria-label="菜单">
          <span></span><span></span><span></span>
        </button>
        <SearchBox @select="person => $emit('searchSelect', person)" />
      </div>
    </div>
  </header>
</template>

<script setup>
import SearchBox from '../search/SearchBox.vue'

defineProps({ sidebarOpen: Boolean })
defineEmits(['toggleSidebar', 'searchSelect'])
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  background: var(--bg);
  padding: 20px 32px 28px;
}
.header-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}
.title-block {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.title {
  font-family: 'Noto Serif SC', serif;
  font-size: 28px;
  font-weight: 700;
  color: var(--accent);
  line-height: 1.2;
}
.subtitle {
  font-size: 14px;
  color: var(--text-muted);
  font-weight: 300;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 8px;
  transition: border-color 0.2s, background 0.2s;
}
.menu-btn:hover { border-color: var(--border-light); }
.menu-btn:active { transform: scale(0.95); }
.menu-btn span {
  display: block;
  width: 22px;
  height: 2px;
  background: var(--text-muted);
  transition: all 0.3s ease;
  transform-origin: center;
}
.menu-btn.open span:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.menu-btn.open span:nth-child(2) { opacity: 0; }
.menu-btn.open span:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

@media (max-width: 900px) {
  .menu-btn { display: flex; }
  .header-inner { gap: 12px; }
  .header-actions { gap: 8px; }
  .title-block { flex: 1; min-width: 0; }
}
@media (max-width: 600px) {
  .header { padding: 6px 8px 8px; }
  .header-inner { flex-direction: column; gap: 3px; }
  .title-block { width: 100%; flex-direction: row; align-items: baseline; gap: 6px; }
  .title { font-size: 17px; white-space: nowrap; }
  .subtitle { font-size: 11px; white-space: nowrap; }
  .header-actions { display: flex; width: 100%; gap: 6px; align-items: center; }
  .menu-btn { width: 34px; height: 34px; padding: 5px; }
  .menu-btn span { width: 18px; }
}
</style>
