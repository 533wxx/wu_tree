<template>
  <div class="search-box">
    <input
      v-model="query"
      type="text"
      placeholder="搜索姓名、字号…"
      autocomplete="off"
      @focus="showResults = true"
      @blur="onBlur"
    >
    <span class="search-icon" @click="focusInput">⌕</span>
    <div v-if="showResults && results.length" class="search-results">
      <div
        v-for="p in results"
        :key="p.id"
        class="search-result-item"
        @mousedown.prevent="selectItem(p)"
      >
        <div>
          <span class="name">{{ p.name }}</span>
          {{ p.zi ? ' · 字' + p.zi : '' }}{{ p.hao ? ' · 号' + p.hao : '' }}
        </div>
        <div class="info">{{ p.branch }}房 · {{ p.gen }}世</div>
      </div>
    </div>
    <div v-if="showResults && query && !results.length" class="search-results">
      <div style="padding:12px 16px;color:var(--text-dim);font-size:13px">未找到匹配结果</div>
    </div>
  </div>
</template>

<script setup>
import { ref, ref as r } from 'vue'
import { useSearch } from '../../composables/useSearch.js'

const { query, results } = useSearch()
const showResults = r(false)

const emit = defineEmits(['select'])

function focusInput(e) {
  const input = e.target.parentElement.querySelector('input')
  if (input) input.focus()
}

function selectItem(person) {
  showResults.value = false
  emit('select', person)
}

function onBlur() {
  setTimeout(() => { showResults.value = false }, 200)
}
</script>

<style scoped>
.search-box {
  position: relative;
  width: 280px;
}
.search-box input {
  width: 100%;
  padding: 8px 36px 8px 14px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  color: var(--text);
  font-size: 13px;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.search-box input:focus {
  border-color: var(--accent-dim);
}
.search-box input::placeholder {
  color: var(--text-dim);
}
.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 22px;
  color: var(--text-dim);
  cursor: pointer;
  user-select: none;
}
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-height: 320px;
  overflow-y: auto;
  z-index: 100;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}
.search-result-item {
  padding: 10px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.15s;
}
.search-result-item:last-child {
  border-bottom: none;
}
.search-result-item:hover {
  background: var(--surface-2);
}
.search-result-item .name {
  font-weight: 600;
  color: var(--accent);
}
.search-result-item .info {
  font-size: 12px;
  color: var(--text-dim);
  margin-top: 2px;
}

@media (max-width: 900px) {
  .search-box { flex: 1; min-width: 0; width: auto; }
}
@media (max-width: 600px) {
  .search-box input { padding: 6px 32px 6px 10px; font-size: 13px; }
  .search-icon { right: 8px; font-size: 20px; }
}
</style>
