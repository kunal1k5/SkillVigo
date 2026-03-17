export function buildUserProfile(currentUser) {
  return {
    name: currentUser?.name || 'Guest Explorer',
    role: currentUser?.role ? `${currentUser.role} account` : 'SkillVigo member',
  };
}
