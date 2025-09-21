import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5050';

export const api = axios.create({ baseURL });

export async function loginApi(email, password) {
  try {
    console.log('Attempting login with:', { email, baseURL });
    const { data } = await api.post('/api/auth/login', { email, password });
    console.log('Login successful:', data);
    return data; // { token, user }
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message);
    throw error;
  }
}

export async function registerApi(name, email, password) {
  const { data } = await api.post('/api/auth/register', { name, email, password });
  return data; // { token, user }
}

export async function updateProfileApi(token, profileData) {
  const { data } = await api.put('/api/auth/profile', profileData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data; // { message, user }
}

export async function createOrderApi(token, orderData) {
  const { data } = await api.post('/api/orders', orderData, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data; // { message, order }
}

export async function getOrderApi(token, orderId) {
  const { data } = await api.get(`/api/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data; // { order }
}

// Fetch all orders for the authenticated user
export async function getUserOrdersApi(token) {
  const { data } = await api.get('/api/orders', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data; // { orders: [...] }
}

// Summary: total quantities grouped by product name
export async function getOrdersSummaryByProductApi(token) {
  const { data } = await api.get('/api/orders/summary/by-product', {
    headers: { Authorization: `Bearer ${token}` }
  });
  return data; // { summary: [{ productName, totalQuantity, ordersCount }] }
}

// OTP-based auth
export async function requestLoginOtpApi(email) {
  const { data } = await api.post('/api/otp/login/request', { email });
  return data; // { message }
}

export async function verifyLoginOtpApi(email, code) {
  const { data } = await api.post('/api/otp/login/verify', { email, code });
  return data; // { token, user }
}

export async function requestRegisterOtpApi(name, email, password) {
  const { data } = await api.post('/api/otp/register/request', { name, email, password });
  return data; // { message }
}

export async function verifyRegisterOtpApi(email, code) {
  const { data } = await api.post('/api/otp/register/verify', { email, code });
  return data; // { token, user }
}

// Password reset
export async function forgotPasswordApi(email) {
  const { data } = await api.post('/api/auth/password/forgot', { email });
  return data; // { message }
}

export async function resetPasswordApi(token, password) {
  const { data } = await api.post('/api/auth/password/reset', { token, password });
  return data; // { message }
}

