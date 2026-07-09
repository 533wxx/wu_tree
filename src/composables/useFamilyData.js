import { ref, readonly } from 'vue'
import { GitHubDB } from 'gh-as-db'

const CACHE_TTL = 604_800_000 // 7 天缓存

// 模块级单例状态
const familyData = ref([])
const isLoading = ref(true)
const error = ref(null)
let cacheTimestamp = 0
let db = null

function getDB() {
  if (!db) {
    db = new GitHubDB({
      accessToken: import.meta.env.VITE_GITHUB_TOKEN,
      owner: '533wxx',
      repo: 'wu_tree_db',
    })
  }
  return db
}

async function fetchData(force = false) {
  // 缓存命中：数据非空且未过期
  if (!force && familyData.value.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const doc = await getDB().collection('familyData').findById('main')
    if (doc && doc.data) {
      familyData.value = doc.data
    } else {
      // 兼容：如果返回的直接就是数组
      familyData.value = Array.isArray(doc) ? doc : (doc || [])
    }
    cacheTimestamp = Date.now()
  } catch (e) {
    error.value = e.message || '数据加载失败'
    console.error('获取世系数据失败:', e)
  } finally {
    isLoading.value = false
  }
}

export function useFamilyData() {
  return {
    familyData: readonly(familyData),
    isLoading: readonly(isLoading),
    error: readonly(error),
    refresh: () => fetchData(true),
    init: () => fetchData(false),
  }
}
