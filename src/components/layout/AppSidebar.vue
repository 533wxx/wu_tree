<template>
  <aside class="sidebar" :class="{ open: isOpen }" :style="sidebarStyle">
    <div class="sidebar-title">房 支 导 航</div>
    <div class="branch-list">
      <button
        v-for="(b, i) in branches"
        :key="b.name"
        class="branch-btn"
        :class="{ active: i === currentBranch }"
        @click="onSelect(i)"
      >
        <span>{{ b.name }}</span>
        <span class="branch-count">{{ b.count }}人</span>
      </button>
    </div>
  </aside>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useBranch } from '../../composables/useBranch.js'
import { useHeader } from '../../composables/useHeader.js'

defineEmits(['select'])

const { currentBranch, branches, selectBranch } = useBranch()
const { headerHeight } = useHeader()

const isOpen = ref(false)
const windowWidth = ref(window.innerWidth)

function onResize() { windowWidth.value = window.innerWidth }
function onSelect(i) {
  selectBranch(i)
  isOpen.value = false
}

onMounted(() => window.addEventListener('resize', onResize))
onUnmounted(() => window.removeEventListener('resize', onResize))

const sidebarStyle = computed(() => {
  const h = headerHeight.value
  return {
    height: `calc(100vh - ${h}px)`,
    paddingTop: windowWidth.value <= 900 ? h + 'px' : '0'
  }
})

function toggle() { isOpen.value = !isOpen.value }
function close() { isOpen.value = false }

defineExpose({ toggle, close, isOpen })
</script>

<style scoped>
.sidebar {
  width: 200px;
  background: var(--surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  flex-shrink: 0;
  padding: 18px 0;
}
.sidebar-title {
  font-family: 'Noto Serif SC', serif;
  font-size: 15px;
  font-weight: 600;
  color: var(--accent);
  padding: 0 16px 14px;
  letter-spacing: 2px;
  text-align: center;
}
.branch-list {
  padding: 0 10px;
}
.branch-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 10px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  background: transparent;
  color: var(--text-muted);
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 2px;
}
.branch-btn:hover {
  background: var(--surface-2);
  color: var(--text);
}
.branch-btn.active {
  background: var(--surface-2);
  border-color: var(--accent-dim);
  color: var(--accent);
  font-weight: 600;
}
.branch-count {
  font-size: 11px;
  color: var(--text-dim);
  background: var(--surface-3);
  padding: 1px 6px;
  border-radius: 3px;
}
.branch-btn.active .branch-count {
  background: var(--accent-dim);
  color: var(--bg);
}

@media (max-width: 900px) {
  .sidebar {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: 260;
    width: 260px;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  .sidebar.open {
    transform: translateX(0);
  }
}
</style>
