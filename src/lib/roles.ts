export const roles = ['admin', 'user', 'courier'] as const;

export type Role = typeof roles[number];

export const hasRole = (userRole: Role, requiredRole: Role) => {
  return userRole === requiredRole;
};
