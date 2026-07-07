import { ref, computed, nextTick } from 'vue'
import { familyData } from '../data/familyData.js'

const allPersons = []

function flattenPerson(person, branch) {
  allPersons.push({ ...person, branch })
  if (person.children) {
    person.children.forEach(c => flattenPerson(c, branch))
  }
}

function buildIndex() {
  allPersons.length = 0
  familyData.forEach(fd => {
    flattenPerson(fd.root, fd.branch)
    if (fd.siblings) fd.siblings.forEach(s => flattenPerson(s, fd.branch))
  })
}

buildIndex()

const query = ref('')

const results = computed(() => {
  const q = query.value.trim()
  if (!q) return []
  return allPersons
    .filter(p => p.name.includes(q) || (p.zi && p.zi.includes(q)) || (p.hao && p.hao.includes(q)))
    .slice(0, 20)
})

function findBranchIndex(branchName) {
  return familyData.findIndex(fd => fd.branch === branchName)
}

class SearchController {
  constructor() {
    this.onSelect = null  // callback: (branchIndex, personId) => void
  }

  selectPerson(person) {
    const idx = findBranchIndex(person.branch)
    if (idx >= 0 && this.onSelect) {
      this.onSelect(idx, person.id)
    }
  }
}

const controller = new SearchController()

export function useSearch() {
  return { query, results, buildIndex, controller }
}
