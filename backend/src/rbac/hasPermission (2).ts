import { ROLE_PERMISSIONS } from "./rolePermissions.js";

export function hasPermission(
  roleName: string,
  permission: string
) {
  const permissions = ROLE_PERMISSIONS[roleName] || [];
  return permissions.includes(permission);
}