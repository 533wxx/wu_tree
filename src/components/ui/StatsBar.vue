<template>
  <div class="stats-bar">
    <div class="stat-item" v-for="s in stats" :key="s.label">
      <div class="stat-label">{{ s.label }}</div>
      <div class="stat-value">{{ s.value }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ branch: Object })

const stats = computed(() => {
  const fd = props.branch
  if (!fd) return []
  const seen = new Set()
  let total = 0, maxGen = 0

  function count(p) {
    if (seen.has(p.id)) return
    seen.add(p.id)
    total++
    if (p.gen > maxGen) maxGen = p.gen
    if (p.children) p.children.forEach(count)
  }

  count(fd.root)
  if (fd.siblings) fd.siblings.forEach(s => count(s))

  return [
    { label: '房支', value: fd.branch },
    { label: '总人数', value: total },
    { label: '世代跨度', value: maxGen + '世' }
  ]
})
</script>

<style scoped>
.stats-bar {
  display: flex;
  gap: 12px;
  padding-bottom: 12px;
  flex-wrap: wrap;
}
.stat-item {
  flex: 1;
  min-width: 100px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 10px 14px;
  text-align: center;
}
.stat-label {
  font-size: 11px;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 4px;
}
.stat-value {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 600;
  color: var(--accent);
}
</style>
