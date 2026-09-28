import client from './client'

export const getIssues = (projectId) =>
  client.get(`/projects/${projectId}/issues`).then(r => r.data)

export const createIssue = (projectId, data) =>
  client.post(`/projects/${projectId}/issues`, data).then(r => r.data)

export const updateIssueStatus = (projectId, issueId, status) =>
  client.put(`/projects/${projectId}/issues/${issueId}`, { status }).then(r => r.data)

export const deleteIssue = (projectId, issueId) =>
  client.delete(`/projects/${projectId}/issues/${issueId}`).then(r => r.data)

export const addIssueResponse = (projectId, issueId, data) =>
  client.post(`/projects/${projectId}/issues/${issueId}/responses`, data).then(r => r.data)
