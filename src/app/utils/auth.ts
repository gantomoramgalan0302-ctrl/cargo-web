export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('userRole');
  window.location.href = '/login';
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function getUser(): any | null {
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}
