import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

// Normalizes errors so components can always read `err.message`
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.'
    if (error.response) {
      message = error.response.data?.detail || `Request failed with status ${error.response.status}`
    } else if (error.request) {
      message = 'Could not reach the server. Please check your connection or try again later.'
    } else {
      message = error.message
    }
    return Promise.reject(new Error(message))
  }
)

export const uploadJobDescription = async (formData) => {
  const { data } = await api.post('/upload-job-description', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const uploadResume = async (formData) => {
  const { data } = await api.post('/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const runAnalysis = async (jobId, candidateId) => {
  const { data } = await api.post('/analyze', {
    job_id: jobId,
    candidate_id: candidateId,
  })
  return data
}

export const getAnalysis = async (analysisId) => {
  const { data } = await api.get(`/analysis/${analysisId}`)
  return data
}

export const getJobs = async () => {
  const { data } = await api.get('/jobs')
  return data
}

export const getCandidates = async () => {
  const { data } = await api.get('/candidates')
  return data
}

export default api
