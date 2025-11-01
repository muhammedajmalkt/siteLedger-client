import axios from "axios"

const API_BASE = "http://localhost:5050/api"

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json", },
  withCredentials:true
})



// -------------------- Auth --------------------
export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),  
  companyIn : () =>api.get("/auth/companyin")
}

// -------------------- Sites --------------------
export const sitesAPI = {
  create: (data) => api.post("/sites", data),
  list: () => api.get("/sites"),
  get: (id) => api.get(`/sites/${id}`),
  update: (id, data) => api.put(`/sites/${id}`, data),
  softDelete: (id) => api.delete(`/sites/soft/${id}`),
  hardDelete: (id) => api.delete(`/sites/hard/${id}`),
}

// -------------------- Spendings --------------------
export const spendingsAPI = {
  create: (siteId, data) => api.post(`/spendings/${siteId}`, data),
  list: (siteId) => api.get(`/spendings/${siteId}`),
  get: (siteId, id) => api.get(`/spendings/${siteId}/${id}`),
  update: (siteId, id, data) => api.put(`/spendings/${siteId}/${id}`, data),
  softDelete: (siteId, id) => api.delete(`/spendings/soft/${siteId}/${id}`),
  hardDelete: (siteId, id) => api.delete(`/spendings/hard/${siteId}/${id}`),
}

// -------------------- Funds --------------------
export const fundsAPI = {
  create: (siteId, data) => api.post(`/funds/${siteId}`, data),
  list: (siteId) => api.get(`/funds/${siteId}`),
  get: (siteId, id) => api.get(`/funds/${siteId}/${id}`),
  update: (siteId, id, data) => api.put(`/funds/${siteId}/${id}`, data),
  softDelete: (siteId, id) => api.delete(`/funds/soft/${siteId}/${id}`),
  hardDelete: (siteId, id) => api.delete(`/funds/hard/${siteId}/${id}`),
}

// -------------------- Reports --------------------
export const reportsAPI = {
  siteReports: () => api.get("/reports/sites"),
}


  // export const companyDetails = async () => {
  //   try {
  //     const res = await authAPI.companyIn()
  //     console.log("Company Info:", res.data.data)
  //   } catch (error) {
  //     console.error("Error fetching company info:", error)
  //   }
  // }