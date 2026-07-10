<template>
  <Teleport to="body">
    <div v-if="isOpen" class="modal-overlay active" @click.self="close">
      <div class="modal">
        <div class="modal-header">
          <h2>{{ selectedPerson?.name }}</h2>
          <button class="close-btn" @click="close">&times;</button>
        </div>
        <div class="modal-body">
          <div class="modal-section">
            <div class="modal-section-title">基 本 信 息</div>
            <div v-if="selectedPerson?.gen" class="modal-field">
              <div class="label">世代</div><div class="value">{{ selectedPerson.gen }}世</div>
            </div>
            <div v-if="selectedPerson?.birthOrder" class="modal-field">
              <div class="label">排行</div><div class="value">{{ selectedPerson.birthOrder }}</div>
            </div>
            <div v-if="selectedPerson?.zi" class="modal-field">
              <div class="label">字</div><div class="value">{{ selectedPerson.zi }}</div>
            </div>
            <div v-if="selectedPerson?.hao" class="modal-field">
              <div class="label">号</div><div class="value">{{ selectedPerson.hao }}</div>
            </div>
            <div v-if="selectedPerson?.birth" class="modal-field">
              <div class="label">生于</div><div class="value">{{ selectedPerson.birth }}</div>
            </div>
            <div v-if="selectedPerson?.wife" class="modal-field">
              <div class="label">配偶</div><div class="value">{{ selectedPerson.wife }}</div>
            </div>
            <div v-if="selectedPerson?.death" class="modal-field">
              <div class="label">歿葬</div><div class="value">{{ selectedPerson.death }}</div>
            </div>
            <div v-if="selectedPerson?.note" class="modal-field">
              <div class="label">备注</div><div class="value">{{ selectedPerson.note }}</div>
            </div>
            <div v-if="selectedPerson?.adoptNote" class="modal-field">
              <div class="label">过继</div><div class="value">{{ selectedPerson.adoptNote }}</div>
            </div>
            <div v-if="selectedPerson?.daughters?.length" class="modal-field">
              <div class="label">女儿</div><div class="value">{{ selectedPerson.daughters.join('、') }}</div>
            </div>
          </div>
          <div v-if="selectedPerson?.children?.length" class="modal-section">
            <div class="modal-section-title">子 嗣（{{ selectedPerson.children.length }}人）</div>
            <div class="modal-children-list">
              <div
                v-for="c in selectedPerson.children"
                :key="c.id"
                class="modal-child-item"
                @click="navigate(c.id)"
              >
                <span>
                  <strong>{{ c.name }}</strong>
                  <template v-if="c.zi"> · 字{{ c.zi }}</template>
                  <template v-if="c.note"> · {{ c.note }}</template>
                </span>
                <span style="color:var(--text-dim);font-size:12px">{{ c.gen }}世</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'
import { useModal } from '../../composables/useModal.js'

const { selectedPerson, isOpen, open, close } = useModal()

defineExpose({ open, close })

const emit = defineEmits(['navigate'])

function navigate(id) {
  close()
  setTimeout(() => emit('navigate', id), 100)
}

function onKeydown(e) {
  if (e.key === 'Escape') close()
}

onMounted(() => document.addEventListener('keydown', onKeydown))
onUnmounted(() => document.removeEventListener('keydown', onKeydown))
</script>

<style scoped>
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0,0,0,0.6);
  align-items: center;
  justify-content: center;
}
.modal-overlay.active {
  display: flex;
}
.modal {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  width: 90%;
  max-width: 520px;
  max-height: 80vh;
  overflow-y: auto;
  animation: modalIn 0.3s ease;
}
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: var(--surface);
  z-index: 1;
}
.modal-header h2 {
  font-family: 'Noto Serif SC', serif;
  font-size: 22px;
  font-weight: 700;
  color: var(--accent);
}
.close-btn {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 40px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  transition: color 0.2s;
}
.close-btn:hover { color: var(--text); }
.modal-body {
  padding: 16px 24px 24px;
}
.modal-section {
  margin-bottom: 16px;
}
.modal-section-title {
  font-size: 13px;
  color: var(--accent-dim);
  letter-spacing: 2px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 10px;
}
.modal-field {
  display: flex;
  padding: 5px 0;
  font-size: 14px;
}
.modal-field .label {
  width: 50px;
  color: var(--text-dim);
  flex-shrink: 0;
}
.modal-field .value {
  color: var(--text);
  flex: 1;
}
.modal-children-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.modal-child-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
}
.modal-child-item:hover {
  border-color: var(--border);
  background: var(--surface-2);
}
</style>
