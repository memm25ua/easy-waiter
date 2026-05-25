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
  locationId: string;
  title: string;
  status: MenuStatus;
  publishedAt: string | null;
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
