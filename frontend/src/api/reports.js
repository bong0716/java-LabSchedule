import client from './client'

export const getReports = (projectId) =>
  client.get(`/projects/${projectId}/reports`).then(r => r.data)

export const createReport = (projectId, data) =>
  client.post(`/projects/${projectId}/reports`, data).then(r => r.data)

export const deleteReport = (projectId, reportId) =>
  client.delete(`/projects/${projectId}/reports/${reportId}`).then(r => r.data)
