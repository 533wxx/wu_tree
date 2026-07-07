<template>
  <div class="tree-container">
    <div v-for="root in roots" :key="root.id" class="gen-row">
      <div v-if="roots.length > 1" class="gen-label">
        <span>{{ root.name }}</span> · {{ root.gen }}世<span v-if="root.zi"> · 字{{ root.zi }}</span>
      </div>
      <div class="nodes-row">
        <TreeNode
          :person="root"
          :depth="0"
          :delay="0"
          @open-modal="person => $emit('openModal', person)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import TreeNode from './TreeNode.vue'

const props = defineProps({ branch: Object })
defineEmits(['openModal'])

const roots = computed(() => {
  if (!props.branch) return []
  return [props.branch.root, ...(props.branch.siblings || [])]
})
</script>

<style scoped>
.tree-container {
  flex: 1;
  overflow-y: auto;
  padding: 8px 0;
}
.gen-row {
  margin-bottom: 16px;
}
.gen-label {
  font-size: 13px;
  color: var(--text-muted);
  padding: 6px 0 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid var(--border);
}
.gen-label span {
  font-family: 'Noto Serif SC', serif;
  font-weight: 600;
  color: var(--accent);
}
.nodes-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-left: 24px;
  position: relative;
}
.nodes-row::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 8px;
  bottom: 8px;
  width: 1px;
  background: var(--border);
}
</style>
