import type { RequestTypeSlug } from "../catalog";
import type { RequestTypeModule } from "./types";

import leaveRequest from "./modules/leave-request";
import documentRequest from "./modules/document-request";
import hardwareIssue from "./modules/hardware-issue";
import softwareIssue from "./modules/software-issue";

export const REGISTRY: Record<RequestTypeSlug, RequestTypeModule<any>> = {
  "leave-request": leaveRequest,
  "document-request": documentRequest,
  "hardware-issue": hardwareIssue,
  "software-issue": softwareIssue,
};
