import { usePermissions } from "@/hooks/usePermission";

interface PermissionGuardProps {
  children: React.ReactNode;
  role: string;
  department: string;
  fallback?: React.ReactNode;
}

export function PermissionGuard({
  children,
  role,
  department,
  fallback = null,
}: PermissionGuardProps) {
  const { hasRole, hasDepartment } = usePermissions();

  const hasRequiredRoles = role.length === 0 || hasRole(role);

  const hasRequiredDepartment =
    department.length === 0 || hasDepartment(department);

  if (hasRequiredRoles && hasRequiredDepartment) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
