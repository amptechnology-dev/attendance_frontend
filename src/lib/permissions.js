export const hasPermission = (user, permission) => {
  if (!user?.role?.permissions) return false;

  const userPermissions = user.role.permissions;

  if (userPermissions.includes("*")) return true;

  if (Array.isArray(permission)) {
    return permission.some((perm) => userPermissions.includes(perm));
  }

  return userPermissions.includes(permission);
};
