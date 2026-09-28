import client from './client'

export const getEvents = (year, month) =>
  client.get('/calendar', { params: { year, month } }).then(r => r.data)

export const getAllEvents = () =>
  client.get('/calendar').then(r => r.data)

export const createEvent = (data) =>
  client.post('/calendar', data).then(r => r.data)

export const updateEvent = (id, data) =>
  client.put(`/calendar/${id}`, data).then(r => r.data)

export const deleteEvent = (id) =>
  client.delete(`/calendar/${id}`).then(r => r.data)
