const API_BASE = '/api';

let authToken = localStorage.getItem('mcp_token');

export function setToken(token) {
  authToken = token;
  localStorage.setItem('mcp_token', token);
}

export function getToken() {
  return authToken || localStorage.getItem('mcp_token');
}

export function clearToken() {
  authToken = null;
  localStorage.removeItem('mcp_token');
}

export function getUser() {
  const stored = localStorage.getItem('mcp_user');
  return stored ? JSON.parse(stored) : null;
}

export function setUser(user) {
  localStorage.setItem('mcp_user', JSON.stringify(user));
}

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export async function login(email) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
  setToken(data.token);
  setUser(data.user);
  return data;
}

export async function getPrices() {
  return request('/stripe/prices');
}

export async function createCheckoutSession(priceId, userId) {
  return request('/stripe/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ priceId, userId }),
  });
}

export async function getScans() {
  return request('/scans');
}

export async function getScanStats() {
  return request('/scans/stats');
}

export async function getScan(id) {
  return request(`/scans/${id}`);
}

export async function saveScan(scanData) {
  return request('/scans', {
    method: 'POST',
    body: JSON.stringify(scanData),
  });
}