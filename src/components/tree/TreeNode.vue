<template>
  <div
    class="node-card"
    :data-id="person.id"
    :style="{ animationDelay: delay * 0.05 + 's' }"
    @click="onCardClick"
  >
    <div class="card-top">
      <span class="name">{{ person.name }}</span>
      <span v-if="person.birthOrder" class="order-badge">{{ person.birthOrder }}</span>
      <span v-if="person.note === '幼歿'" class="death-badge">幼歿</span>
      <span class="gen-badge">{{ person.gen }}世</span>
    </div>
    <div v-if="person.zi || person.hao" class="zi">
      字{{ person.zi }}<template v-if="person.hao"> 号{{ person.hao }}</template>
    </div>
    <div class="detail">
      <div v-if="person.birthDisplay">生于 {{ person.birthDisplay }}</div>
      <div v-else-if="person.birth">生于 {{ person.birth }}</div>
      <div v-if="person.wifeDisplay || person.wife" class="highlight">
        {{ person.wifeDisplay || person.wife }}
      </div>
      <div v-if="person.adoptNote" class="adopt-badge">{{ person.adoptNote }}</div>
      <div v-if="person.deathDisplay || person.death" style="color:var(--text-dim)">
        {{ person.deathDisplay || person.death }}
      </div>
    </div>
    <div
      v-if="hasChildren"
      class="has-children"
      :class="{ open: isOpen }"
      @click.stop="handleToggle"
    >
      {{ isOpen ? '▾' : '▸' }} {{ person.children.length }} 子嗣{{ isOpen ? '收起' : '展开' }}
    </div>
  </div>
  <div v-if="hasChildren" class="children-wrapper">
    <div class="children-container" :class="{ show: isOpen }">
      <div class="children-header">
        {{ person.children[0].gen }}世 · {{ person.children.length }}人
      </div>
      <div class="children-row">
        <TreeNode
          v-for="(child, i) in person.children"
          :key="child.id"
          :person="child"
          :depth="depth + 1"
          :delay="i + depth * 3"
          @open-modal="p => $emit('openModal', p)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  person: Object,
  depth: { type: Number, default: 0 },
  delay: { type: Number, default: 0 }
})

const emit = defineEmits(['openModal'])

const hasChildren = props.person.children && props.person.children.length > 0
const isOpen = ref(false)

function onCardClick(e) {
  if (e.target.classList.contains('has-children')) return
  emit('openModal', props.person)
}

function handleToggle() {
  isOpen.value = !isOpen.value
}
</script>

<style scoped>
.node-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.25s ease;
  position: relative;
  max-width: 480px;
  animation: fadeIn 0.4s ease forwards;
  opacity: 0;
}
.node-card:hover {
  border-color: var(--accent-dim);
  background: var(--surface-2);
  transform: translateY(-1px);
}
.card-top {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.name {
  font-family: 'Noto Serif SC', serif;
  font-size: 18px;
  font-weight: 700;
  color: var(--text);
}
.gen-badge {
  font-size: 11px;
  color: var(--text-dim);
  background: var(--surface-3);
  padding: 1px 8px;
  border-radius: 10px;
  margin-left: auto;
}
.order-badge {
  font-size: 11px;
  color: var(--accent);
  background: rgba(200,160,80,0.1);
  padding: 1px 6px;
  border-radius: 3px;
}
.death-badge {
  font-size: 11px;
  color: var(--red);
  background: rgba(176,64,64,0.1);
  padding: 1px 6px;
  border-radius: 3px;
}
.zi {
  font-size: 13px;
  color: var(--text-muted);
  margin-top: 4px;
}
.detail {
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.6;
}
.detail .highlight {
  color: var(--accent-dim);
}
.adopt-badge {
  display: inline-block;
  font-size: 11px;
  color: var(--blue);
  background: rgba(64,96,160,0.1);
  padding: 1px 8px;
  border-radius: 3px;
  margin-top: 2px;
}
.has-children {
  display: inline-block;
  margin-top: 8px;
  padding: 4px 14px;
  border: 1px solid var(--accent-dim);
  border-radius: var(--radius);
  color: var(--accent-dim);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.has-children:hover {
  background: var(--surface-2);
}
.has-children.open {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--surface-3);
}

.children-wrapper {
  /* for connector lines */
}
.children-container {
  display: none;
  padding-left: 24px;
  margin-left: 12px;
  border-left: 1px solid var(--border);
}
.children-container.show {
  display: block;
}
.children-header {
  font-size: 12px;
  color: var(--text-dim);
  padding: 8px 0 6px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--border);
  position: relative;
}
.children-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 0 8px;
}

@media (max-width: 600px) {
  .node-card {
    max-width: 100%;
    padding: 10px 12px;
  }
  .children-container {
    padding-left: 16px;
    margin-left: 4px;
  }
}
</style>
