export const Roles = {
  ADMIN: 'ADMIN',
  CUSTOMER: 'CUSTOMER',
} as const;

export type RoleType = typeof Roles[keyof typeof Roles];
