<template>
  <main class="main">
    <div class="sticky-panel">
      <Breadcrumb :branch-name="branchData?.branch" />
      <StatsBar :branch="branchData" />
    </div>
    <TreeView :branch="branchData" @open-modal="p => $emit('openModal', p)" />
  </main>
</template>

<script setup>
import { computed } from 'vue'
import { useBranch } from '../../composables/useBranch.js'
import Breadcrumb from '../ui/Breadcrumb.vue'
import StatsBar from '../ui/StatsBar.vue'
import TreeView from '../tree/TreeView.vue'

const { branchData } = useBranch()
defineEmits(['openModal'])
</script>

<style scoped>
.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 24px 32px;
}
.sticky-panel {
  flex-shrink: 0;
  padding-bottom: 8px;
}

@media (max-width: 900px) {
  .main { padding: 16px; }
}
</style>
