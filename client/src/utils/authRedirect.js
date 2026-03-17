export function getDefaultRouteForRole(role) {
  if (role === 'admin') {
    return '/admin';
  }

  if (role === 'provider') {
    return '/create-skill';
  }

  return '/dashboard';
}
