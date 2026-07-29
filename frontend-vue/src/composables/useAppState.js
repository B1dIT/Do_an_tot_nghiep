import { ref, watch } from 'vue'

const STORAGE_KEY = 'cv_insight_app_state'

function loadState() {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const persisted = loadState()

const state = ref({
  recommendedJobs: persisted.recommendedJobs || [],
  cvText: persisted.cvText || '',
  cvFileName: persisted.cvFileName || '',
  selectedJobForInterview: persisted.selectedJobForInterview || null,
  lastAnalysisAt: persisted.lastAnalysisAt || null,
})

watch(
  state,
  (value) => {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value))
  },
  { deep: true }
)

export function useAppState() {
  function setRecommendedJobs(jobs) {
    state.value.recommendedJobs = Array.isArray(jobs) ? jobs : []
    state.value.lastAnalysisAt = new Date().toISOString()
  }

  function setCvInfo({ text, fileName }) {
    if (text !== undefined) state.value.cvText = text
    if (fileName !== undefined) state.value.cvFileName = fileName
  }

  function setSelectedJobForInterview(job) {
    state.value.selectedJobForInterview = job
  }

  function clearSelectedJobForInterview() {
    state.value.selectedJobForInterview = null
  }

  return {
    state,
    setRecommendedJobs,
    setCvInfo,
    setSelectedJobForInterview,
    clearSelectedJobForInterview,
  }
}
