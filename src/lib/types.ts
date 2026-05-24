export type StaffRole = "owner" | "manager" | "staff";
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

export interface StaffAssignment {
  id: string;
  restaurantId: string;
  locationId: string;
  role: StaffRole;
  restaurantName: string;
  locationName: string;
  currency: string;
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
  status: "active" | "closed" | "expired";
  openedAt: string;
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
