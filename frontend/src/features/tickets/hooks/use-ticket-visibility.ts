import { usePermissions } from "@/features/auth/hooks/usePermission";

export function useTicketVisibility() {
  const { hasRole } = usePermissions();
  const isAdmin = hasRole("ADMIN");

  return {
    showPriority: isAdmin,
    showAssignee: isAdmin,
    showPoster: isAdmin,
    showInformation: isAdmin,
    showAiSummary: true, // Visible to both roles per spec
    showAdminControls: isAdmin,
    canGenerateSummary: isAdmin,
  };
}
