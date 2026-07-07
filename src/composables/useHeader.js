import { ref, onMounted, onUnmounted } from 'vue'

const headerHeight = ref(93)

export function useHeader() {
  function sync() {
    const header = document.querySelector('.header')
    if (header) {
      const h = header.offsetHeight
      headerHeight.value = h
      document.documentElement.style.setProperty('--header-height', h + 'px')
    }
  }

  onMounted(() => {
    sync()
    window.addEventListener('resize', sync)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', sync)
  })

  return { headerHeight, sync }
}
