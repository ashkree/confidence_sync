export const APP_NAME = "Confidence Sync";

export function pageTitle(page?: string): string {
  return page ? `${page} · ${APP_NAME}` : APP_NAME;
}
