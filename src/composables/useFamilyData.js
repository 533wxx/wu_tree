import { ref, readonly } from 'vue'

const CACHE_TTL = 604_800_000 // 7 天缓存

// 数据文件在 wu_tree_db 仓库中的路径
const DATA_PATH = 'contents/collections/familyData.json'
const OWNER = '533wxx'
const REPO = 'wu_tree_db'
const BRANCH = 'main'

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
    // 公开仓库直接用 raw.githubusercontent.com，无需 token
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DATA_PATH}`
    let res = await fetch(rawUrl)

    // 如果 raw 返回 404，尝试用 API（支持私有仓库 + token）
    if (!res.ok) {
      const token = import.meta.env.VITE_GITHUB_TOKEN
      if (token) {
        const apiUrl = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${DATA_PATH}`
        res = await fetch(apiUrl, {
          headers: {
            Accept: 'application/vnd.github.v3+json',
            Authorization: `Bearer ${token}`,
          },
        })
        if (res.ok) {
          const json = await res.json()
          familyData.value = JSON.parse(atob(json.content.replace(/\s/g, '')))
          cacheTimestamp = Date.now()
          return
        }
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    familyData.value = await res.json()
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
