import { useRouter } from "@tanstack/react-router";

export function usePermissions() {
  const router = useRouter();
  const auth = router.options.context.auth;

  return {
    hasRole: auth.hasRole,
    hasDepartment: auth.hasDepartment,
    user: auth.user,
  };
}
