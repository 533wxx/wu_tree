<template>
  <!-- 加载中 -->
  <div v-if="isLoading" class="loading-screen">
    <div class="spinner"></div>
    <p>载入世系数据…</p>
  </div>

  <!-- 加载失败 -->
  <div v-else-if="error" class="error-screen">
    <div class="error-icon">!</div>
    <p>数据加载失败</p>
    <p class="error-detail">{{ error }}</p>
    <button class="retry-btn" @click="retry">重新加载</button>
  </div>

  <!-- 正常内容 -->
  <template v-else>
    <AppHeader
      :sidebar-open="sidebarOpen"
      @toggle-sidebar="toggleSidebar"
      @search-select="onSearchSelect"
    />
    <div class="sidebar-overlay" :class="{ active: sidebarOpen }" @click="closeSidebar"></div>
    <div class="layout" :style="{ paddingTop: headerHeight + 'px' }">
      <AppSidebar ref="sidebarRef" @select="closeSidebar" />
      <MainContent @open-modal="openModal" />
    </div>
    <PersonModal @navigate="onNavigate" />
  </template>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useBranch } from './composables/useBranch.js'
import { useModal } from './composables/useModal.js'
import { useSearch } from './composables/useSearch.js'
import { useHeader } from './composables/useHeader.js'
import { useFamilyData } from './composables/useFamilyData.js'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import PersonModal from './components/modal/PersonModal.vue'

const { selectBranch } = useBranch()
const { open } = useModal()
const { controller, buildIndex } = useSearch()
const { headerHeight } = useHeader()
const { isLoading, error, init, refresh, familyData } = useFamilyData()

const sidebarRef = ref(null)
const sidebarOpen = ref(false)

onMounted(async () => {
  await init()
  if (!error.value && familyData.value.length > 0) {
    buildIndex(familyData.value)
  }
  controller.onSelect = (branchIdx, personId) => {
    selectBranch(branchIdx)
    sidebarOpen.value = false
    nextTick(() => {
      setTimeout(() => navigateToPerson(personId), 150)
    })
  }
})

async function retry() {
  await refresh()
  if (!error.value && familyData.value.length > 0) {
    buildIndex(familyData.value)
  }
}

function toggleSidebar() {
  if (!sidebarRef.value) return
  const wasOpen = sidebarOpen.value
  if (wasOpen) {
    closeSidebar()
  } else {
    sidebarRef.value.isOpen = true
    sidebarOpen.value = true
  }
}

function closeSidebar() {
  if (sidebarRef.value) {
    sidebarRef.value.close()
    sidebarOpen.value = false
  }
}

function openModal(person) {
  open(person)
}

function onSearchSelect(person) {
  controller.selectPerson(person)
}

function onNavigate(id) {
  nextTick(() => {
    navigateToPerson(id)
  })
}

function navigateToPerson(id) {
  expandToNode(id)
  setTimeout(() => {
    const el = document.querySelector(`[data-id="${id}"]`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el.style.borderColor = 'var(--accent)'
      el.style.boxShadow = '0 0 20px rgba(200,160,80,0.3)'
      setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = '' }, 2000)
    }
  }, 200)
}

function expandToNode(id) {
  const target = document.querySelector(`[data-id="${id}"]`)
  if (!target) return
  let el = target
  while (el) {
    const cc = el.closest('.children-container')
    if (cc && !cc.classList.contains('show')) {
      cc.classList.add('show')
    }
    el = el.parentElement
  }
}
</script>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}
.sidebar-overlay {
  display: none;
}
.sidebar-overlay.active {
  display: block;
  position: fixed;
  inset: 0;
  z-index: 250;
  background: rgba(0,0,0,0.4);
}

@media (min-width: 901px) {
  .sidebar-overlay {
    display: none !important;
  }
}

/* 加载屏 */
.loading-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  height: 100dvh;
  color: var(--text-muted);
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  gap: 16px;
}
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 错误屏 */
.error-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  height: 100dvh;
  color: var(--text-muted);
  font-family: 'Noto Serif SC', serif;
  font-size: 16px;
  gap: 12px;
}
.error-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #c0392b;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 22px;
}
.error-detail {
  font-size: 13px;
  color: var(--text-dim);
  max-width: 320px;
  text-align: center;
  word-break: break-all;
}
.retry-btn {
  margin-top: 8px;
  padding: 8px 24px;
  border: 1px solid var(--accent-dim);
  border-radius: var(--radius);
  background: var(--surface-2);
  color: var(--accent);
  font-family: inherit;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.2s;
}
.retry-btn:hover {
  background: var(--surface-3);
}
</style>
