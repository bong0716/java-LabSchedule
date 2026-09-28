import client from './client'

export const getMembers = (projectId) =>
  client.get(`/projects/${projectId}/members`).then(r => r.data)

export const addMember = (projectId, data) =>
  client.post(`/projects/${projectId}/members`, data).then(r => r.data)

export const updateMember = (projectId, memberId, data) =>
  client.put(`/projects/${projectId}/members/${memberId}`, data).then(r => r.data)

export const removeMember = (projectId, memberId) =>
  client.delete(`/projects/${projectId}/members/${memberId}`).then(r => r.data)
