import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
})

// Attach JWT to every outgoing request, if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalizes errors so components can always read `err.message`
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'Something went wrong. Please try again.'
    if (error.response) {
      message = error.response.data?.detail || `Request failed with status ${error.response.status}`
      if (error.response.status === 401) {
        localStorage.removeItem('authToken')
        localStorage.removeItem('authUser')
      }
    } else if (error.request) {
      message = 'Could not reach the server. Please check your connection or try again later.'
    } else {
      message = error.message
    }
    return Promise.reject(new Error(message))
  }
)

// ---------- Auth ----------

export const registerRequest = async (name, email, password, role) => {
  const { data } = await api.post('/auth/register', { name, email, password, role })
  return data
}

export const loginRequest = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const fetchMe = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// ---------- Jobs ----------

export const uploadJobDescription = async (formData) => {
  const { data } = await api.post('/upload-job-description', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getJobs = async () => {
  const { data } = await api.get('/jobs')
  return data
}

// ---------- Candidates ----------

export const uploadResume = async (formData) => {
  const { data } = await api.post('/upload-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export const getMyCandidateProfile = async () => {
  const { data } = await api.get('/candidates/me')
  return data
}

export const getCandidates = async () => {
  const { data } = await api.get('/candidates')
  return data
}

// ---------- Analysis ----------

export const runAnalysis = async (jobId) => {
  const { data } = await api.post('/analyze', { job_id: jobId })
  return data
}

export const getAnalysis = async (analysisId) => {
  const { data } = await api.get(`/analysis/${analysisId}`)
  return data
}

export default api
