import api from './api';

export function getMyBookings() {
  return api.get('/bookings').then((response) => response.data);
}

export function getBookingById(id) {
  return api.get(`/bookings/${id}`).then((response) => response.data);
}

export function createBooking(bookingData) {
  return api.post('/bookings', bookingData).then((response) => response.data);
}

export function updateBookingStatus(id, status) {
  return api.put(`/bookings/${id}`, { status }).then((response) => response.data);
}

export function cancelBooking(id) {
  return api.delete(`/bookings/${id}`).then((response) => response.data);
}
