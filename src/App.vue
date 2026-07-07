<template>
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

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useBranch } from './composables/useBranch.js'
import { useModal } from './composables/useModal.js'
import { useSearch } from './composables/useSearch.js'
import { useHeader } from './composables/useHeader.js'
import AppHeader from './components/layout/AppHeader.vue'
import AppSidebar from './components/layout/AppSidebar.vue'
import MainContent from './components/layout/MainContent.vue'
import PersonModal from './components/modal/PersonModal.vue'

const { selectBranch } = useBranch()
const { open } = useModal()
const { controller } = useSearch()
const { headerHeight } = useHeader()

const sidebarRef = ref(null)
const sidebarOpen = ref(false)

onMounted(() => {
  controller.onSelect = (branchIdx, personId) => {
    selectBranch(branchIdx)
    sidebarOpen.value = false
    nextTick(() => {
      setTimeout(() => navigateToPerson(personId), 150)
    })
  }
})

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
</style>
