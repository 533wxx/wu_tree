import { ref, computed } from 'vue'

const selectedPerson = ref(null)
const isOpen = computed(() => selectedPerson.value !== null)

export function useModal() {
  function open(person) {
    selectedPerson.value = person
  }

  function close() {
    selectedPerson.value = null
  }

  return { selectedPerson, isOpen, open, close }
}
