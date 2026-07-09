import { ref, readonly } from 'vue'

const CACHE_TTL = 604_800_000 // 7 天缓存

// 数据文件在 wu_tree_db 仓库中的路径
const DATA_PATH = 'collections/familyData.json'
const OWNER = '533wxx'
const REPO = 'wu_tree_db'

// 模块级单例状态
const familyData = ref([])
const isLoading = ref(true)
const error = ref(null)
let cacheTimestamp = 0

async function fetchData(force = false) {
  // 缓存命中：数据非空且未过期
  if (!force && familyData.value.length > 0 && Date.now() - cacheTimestamp < CACHE_TTL) {
    return
  }

  isLoading.value = true
  error.value = null

  try {
    const token = import.meta.env.VITE_GITHUB_TOKEN
    const headers = { Accept: 'application/vnd.github.v3+json' }
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`
    const res = await fetch(apiUrl, { headers })

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    const json = await res.json()
    // GitHub Contents API 返回 base64 编码的内容
    const raw = atob(json.content.replace(/\s/g, ''))
    familyData.value = JSON.parse(raw)
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
