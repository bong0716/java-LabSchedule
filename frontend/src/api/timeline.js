import client from './client'

export const getTimeline = (projectId) =>
  client.get(`/projects/${projectId}/timeline`).then(r => r.data)
