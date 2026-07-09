import { ref, computed } from 'vue'
import { useFamilyData } from './useFamilyData.js'

const currentBranch = ref(0)

export function useBranch() {
  const { familyData } = useFamilyData()

  const branchData = computed(() => familyData.value[currentBranch.value])

  const branches = computed(() =>
    familyData.value.map(fd => {
      let count = 0
      const countFn = p => { count++; if (p.children) p.children.forEach(countFn) }
      countFn(fd.root)
      if (fd.siblings) fd.siblings.forEach(s => countFn(s))
      return { name: fd.branch, count }
    })
  )

  function selectBranch(index) {
    currentBranch.value = index
  }

  return { currentBranch, branchData, branches, selectBranch }
}
