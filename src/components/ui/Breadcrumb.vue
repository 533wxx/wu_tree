<template>
  <div class="breadcrumb">
    <span>高橋吳氏</span><span class="sep">›</span>
    <span>卷十三 世系</span><span class="sep">›</span>
    <span class="current">{{ branchName }}房</span>
  </div>
</template>

<script setup>
defineProps({ branchName: String })
</script>

<style scoped>
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--text-muted);
  padding: 8px 0 12px;
  flex-wrap: wrap;
}
.breadcrumb .sep {
  font-size: 10px;
  color: var(--border-light);
}
.breadcrumb .current {
  color: var(--accent);
  font-weight: 600;
}
</style>
