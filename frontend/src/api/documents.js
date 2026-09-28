import client from './client'

export const getDocuments = (projectId) =>
  client.get(`/projects/${projectId}/documents`).then(r => r.data)

export const uploadDocument = (projectId, data) =>
  client.post(`/projects/${projectId}/documents`, data).then(r => r.data)

export const addVersion = (projectId, documentId, data) =>
  client.post(`/projects/${projectId}/documents/${documentId}/versions`, data).then(r => r.data)

export const deleteDocument = (projectId, documentId) =>
  client.delete(`/projects/${projectId}/documents/${documentId}`).then(r => r.data)
