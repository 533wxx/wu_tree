import { ref, readonly } from 'vue'
import { familyData as localData } from '../data/familyData.js'

const CACHE_TTL = 86_400_000 // 1 天缓存
const STORAGE_KEY_DATA = 'wu_family_data'
const STORAGE_KEY_TS = 'wu_family_ts'

// 数据文件在 wu_tree_db 仓库中的路径
const DATA_PATH = 'contents/collections/familyData.json'
const OWNER = '533wxx'
const REPO = 'wu_tree_db'
const BRANCH = 'main'

// 从 localStorage 恢复缓存
function loadFromStorage() {
  try {
    const ts = localStorage.getItem(STORAGE_KEY_TS)
    const data = localStorage.getItem(STORAGE_KEY_DATA)
    if (data && ts) {
      return { data: JSON.parse(data), ts: parseInt(ts) }
    }
  } catch {}
  return null
}

function saveToStorage(data, ts) {
  try {
    localStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data))
    localStorage.setItem(STORAGE_KEY_TS, String(ts))
  } catch {}
}

// 模块级单例状态
const cached = loadFromStorage()
const familyData = ref(cached ? cached.data : localData)
const isLoading = ref(false)
const error = ref(null)
let cacheTimestamp = cached ? cached.ts : Date.now() // 首次使用本地数据，开始 1 天倒计时

async function fetchData(force = false) {
  // 缓存有效 → 不请求
  if (!force && Date.now() - cacheTimestamp < CACHE_TTL) {
    return
  }

  // 缓存过期 → 后台静默拉取
  isLoading.value = true
  error.value = null

  try {
    const rawUrl = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${DATA_PATH}?t=${Date.now()}`
    let res = await fetch(rawUrl, { cache: 'no-store' })

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
          saveToStorage(familyData.value, cacheTimestamp)
          return
        }
      }
      throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    }

    familyData.value = await res.json()
    cacheTimestamp = Date.now()
    saveToStorage(familyData.value, cacheTimestamp)
  } catch (e) {
    if (familyData.value.length > 0) {
      console.warn('后台更新失败，使用本地缓存:', e.message)
    } else {
      error.value = e.message || '数据加载失败'
      console.error('获取世系数据失败:', e)
    }
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
