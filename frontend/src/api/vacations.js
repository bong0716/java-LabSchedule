import client from './client'

export const getVacations = () =>
  client.get('/vacations').then(r => r.data)

export const createVacation = (data) =>
  client.post('/vacations', data).then(r => r.data)

export const updateVacation = (id, data) =>
  client.put(`/vacations/${id}`, data).then(r => r.data)

export const deleteVacation = (id) =>
  client.delete(`/vacations/${id}`).then(r => r.data)
