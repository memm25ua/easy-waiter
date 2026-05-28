export type StaffRole = "owner" | "manager" | "staff";
export type StaffInvitationStatus =
  | "pending"
  | "accepted"
  | "expired"
  | "revoked";
export type MenuStatus = "draft" | "published" | "archived";
export type ImportStatus =
  | "uploaded"
  | "processing"
  | "needs_review"
  | "approved"
  | "failed";
export type MenuImportJobStatus =
  | "uploaded"
  | "ocr_processing"
  | "ai_processing"
  | "review_ready"
  | "failed"
  | "cancelled";
export type ImportWarningSeverity = "critical" | "non_critical";
export type ImportWarningStatus = "open" | "resolved" | "accepted";
export type ImportWarningTargetType =
  | "draft"
  | "category"
  | "item"
  | "option_group"
  | "option_value";
export type MenuDraftStatus =
  | "draft"
  | "review_ready"
  | "ready_to_publish"
  | "published"
  | "archived";
export type OrderStatus =
  | "new"
  | "accepted"
  | "preparing"
  | "ready"
  | "served"
  | "cancelled"
  | "needs_attention";
export type OrderSource = "manual" | "ai";
export type AssignmentState = "active" | "inactive" | "missing";
export type SupportedLocale = "en" | "es";
export type LocaleSource =
  | "explicit"
  | "account"
  | "session"
  | "browser"
  | "default";

export interface StaffAssignment {
  id: string;
  accountId?: string | null;
  restaurantId: string;
  locationId: string;
  role: StaffRole;
  isActive?: boolean;
  restaurantName: string;
  locationName: string;
  currency: string;
  invitationId?: string | null;
  acceptedAt?: string | null;
}

export interface StaffInvitation {
  id: string;
  restaurantId: string;
  locationId: string;
  email: string;
  role: Exclude<StaffRole, "owner">;
  status: StaffInvitationStatus;
  invitedByAccountId: string;
  acceptedByAccountId: string | null;
  expiresAt: string;
  acceptedAt: string | null;
  createdAt: string;
}

export interface Account {
  id: string;
  email: string;
  displayName: string;
  preferredLocale?: SupportedLocale | null;
  createdAt: string;
  lastSignInAt: string | null;
}

export interface LanguagePreference {
  id: string;
  accountId?: string | null;
  anonymousSessionId?: string | null;
  locale: SupportedLocale;
  source: LocaleSource;
  createdAt: string;
  updatedAt: string;
}

export interface MenuItemOptionValue {
  id: string;
  name: string;
  priceDelta: number;
  isAvailable: boolean;
}

export interface MenuItemOption {
  id: string;
  name: string;
  isRequired: boolean;
  minChoices: number;
  maxChoices: number;
  values: MenuItemOptionValue[];
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  dietaryTags: string[];
  allergenNotes: string;
  isAvailable: boolean;
  sortOrder: number;
  options: MenuItemOption[];
  confidenceFlags?: string[];
  suggestions?: string[];
}

export interface MenuSection {
  id: string;
  name: string;
  description: string;
  sortOrder: number;
  items: MenuItem[];
}

export interface Menu {
  id: string;
  restaurantId?: string | null;
  locationId: string;
  title: string;
  status: MenuStatus;
  publishedAt: string | null;
  currentVersion?: number;
  sections: MenuSection[];
}

export interface CartSelection {
  optionId: string;
  valueIds: string[];
}

export interface CartItem {
  menuItemId: string;
  quantity: number;
  notes?: string;
  selections: CartSelection[];
}

export interface CartValidationIssue {
  code:
    | "missing_item"
    | "unavailable_item"
    | "invalid_quantity"
    | "missing_required_option"
    | "too_few_options"
    | "too_many_options"
    | "unavailable_option_value"
    | "unknown_option_value";
  message: string;
  menuItemId?: string;
}

export interface ValidatedCart {
  issues: CartValidationIssue[];
  total: number;
  currency: string;
}

export interface TableSession {
  id: string;
  sessionCode: string;
  tableLabel: string;
  locationId: string;
  restaurantId?: string;
  status: "active" | "closed" | "expired";
  openedAt: string;
  expiresAt?: string | null;
}

export interface Order {
  id: string;
  locationId: string;
  tableSessionId: string;
  tableLabel: string;
  source: OrderSource;
  status: OrderStatus;
  items: CartItem[];
  total: number;
  currency: string;
  customerNotes: string;
  staffNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface MenuImportDraft {
  id: string;
  locationId: string;
  status: ImportStatus;
  sourceFilePath: string;
  confidenceSummary: string[];
  errorMessage: string | null;
  menu: Menu;
}

export interface MenuImportJob {
  id: string;
  restaurantId: string;
  locationId: string;
  uploadedByAccountId?: string | null;
  sourceFilePath: string;
  sourceFileName: string;
  sourceFileType: "pdf" | "png" | "jpg" | "jpeg" | "webp";
  sourceFileSize: number;
  status: MenuImportJobStatus;
  ocrText: string;
  ocrConfidenceSummary: Record<string, unknown>;
  aiPromptVersion: string;
  aiModel: string;
  aiResourceReference: string;
  aiResponseSummary: Record<string, unknown>;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

export interface ImportWarning {
  id: string;
  menuImportJobId: string;
  menuDraftId?: string | null;
  targetType: ImportWarningTargetType;
  targetId?: string | null;
  severity: ImportWarningSeverity;
  fieldName: string;
  message: string;
  sourceExcerpt: string;
  status: ImportWarningStatus;
  createdAt: string;
  resolvedByAccountId?: string | null;
  resolvedAt?: string | null;
}

export interface MenuDraftVersion {
  id: string;
  menuDraftId: string;
  versionNumber: number;
  changeSummary: string;
  changedByAccountId?: string | null;
  createdAt: string;
}

export interface PublishedMenuSnapshot {
  id: string;
  restaurantId: string;
  locationId: string;
  menuDraftId: string;
  menuDraftVersion: number;
  publishedByAccountId?: string | null;
  publishedAt: string;
  isCurrent: boolean;
  snapshotPayload: Menu;
}

export interface StableTableLink {
  tableId: string;
  locationId: string;
  tableLabel: string;
  tokenHint?: string | null;
  customerUrl: string;
  isActive: boolean;
}

export interface OrderStatusEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  changedByAccountId?: string | null;
  createdAt: string;
}

export interface OperationalSummary {
  totalOrders: number;
  aiAssistedOrders: number;
  manualOrders: number;
  staffInterventions: number;
  averageSubmissionSeconds: number;
}

export interface AiActionAudit {
  id: string;
  conversationId: string | null;
  tableSessionId: string | null;
  restaurantId: string;
  locationId: string;
  actionType: string;
  proposedPayload: unknown;
  confirmationState: "not_required" | "required" | "confirmed" | "rejected";
  providerStatus: "not_called" | "success" | "timeout" | "error" | "disabled";
  result: string;
  escalationReason: string | null;
  submittedOrderId: string | null;
  locale?: SupportedLocale | null;
  createdAt: string;
}

export interface MarketingLead {
  id: string;
  email: string;
  restaurantName: string;
  contactName: string;
  message: string;
  source: string;
  locale?: SupportedLocale | null;
  createdAt: string;
}

export interface DeploymentSmokeTest {
  id: string;
  environment: string;
  status: "pass" | "fail";
  details: Record<string, unknown>;
  createdAt: string;
}
