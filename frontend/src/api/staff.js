import client from './client'

export const getStaffList = () =>
  client.get('/staff').then(r => r.data)

export const getStaffDetail = (id) =>
  client.get(`/staff/${id}`).then(r => r.data)

export const createStaff = (data) =>
  client.post('/staff', data).then(r => r.data)
