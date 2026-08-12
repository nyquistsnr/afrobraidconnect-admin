export type UserType = "CUSTOMER" | "BRAIDER" | "ADMIN";

export type OnboardingStep =
  | "BUSINESS_INFO"
  | "PHONE_VERIFICATION"
  | "VERIFF"
  | "SERVICE_TYPE"
  | "PORTFOLIO"
  | "SERVICE_LOCATION"
  | "AVAILABILITY"
  | "PAYMENT_SETUP"
  | "COMPLETED";

export interface BraiderOnboardingSummary {
  current_step: OnboardingStep;
  completed_at: string | null;
}

export interface BraiderAuthProfile {
  business_name: string | null;
  logo_url: string | null;
  onboarding: BraiderOnboardingSummary;
}

export interface UserPublic {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  user_type: UserType;
  // Sticky chat-translation preference (lib/api/chat-client.ts) — distinct
  // from the request/display locale (Accept-Language / ?lang=). Null until
  // the user explicitly sets it via PATCH /users/me.
  chat_locale: string | null;
}

export interface UserProfileUpdateRequest {
  first_name?: string;
  last_name?: string | null;
  phone_number?: string | null;
  // "" clears it server-side. Omit the field entirely to leave unchanged.
  chat_locale?: string;
}

// Returned by verify-email, login, social/{provider}, refresh.
export interface AuthTokenResponse extends UserPublic {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  // Only populated by /login and /social/{provider}; null on /verify-email and /refresh.
  braider: BraiderAuthProfile | null;
}

export interface ApiErrorBody {
  code: string;
  message: string;
  details?: unknown[];
}

export interface ApiEnvelope<T> {
  status: "success" | "error";
  status_label: string;
  data: T | null;
  error: ApiErrorBody | null;
}

export type AdminInviteStatus = "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";

export interface AdminInviteResponse {
  id: string;
  email: string;
  status: AdminInviteStatus;
  invited_by_user_id: string;
  created_at: string;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
}

export interface AdminInviteRequest {
  email: string;
}

export interface AdminInviteAcceptRequest {
  token: string;
  first_name: string;
  last_name?: string;
  password?: string;
}

export interface AdminInviteSocialAcceptRequest {
  token: string;
  provider_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export type SocialProvider = "google" | "facebook" | "tiktok";

export interface SocialLoginRequest {
  provider_token: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

export interface LogoutRequest {
  refresh_token: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  new_password: string;
}

// ---------------------------------------------------------------------------
// Admin User Management
// ---------------------------------------------------------------------------

export interface AdminUserResponse {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  user_type: UserType;
  is_email_verified: boolean;
  is_active: boolean;
  suspension_reason: string | null;
  suspended_at: string | null;
  created_at: string;
}

export interface SuspendUserRequest {
  reason?: string;
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PaginatedData<T> {
  items: T[];
  pagination: PaginationMeta;
}

// ---------------------------------------------------------------------------
// Admin style catalog
// ---------------------------------------------------------------------------

export type TranslationSource = "HUMAN" | "MACHINE" | "PENDING" | "FAILED" | null;

export interface StyleCategory {
  id: string;
  slug: string;
  name_en: string;
  name_de: string | null;
  name_fr: string | null;
  name_en_source: TranslationSource;
  name_de_source: TranslationSource;
  name_fr_source: TranslationSource;
  display_order: number;
}

export interface StyleImage { id: string; url: string; position: number; }
export interface StyleVariation {
  id: string;
  name_en: string;
  name_de: string | null;
  name_fr: string | null;
  name_en_source: TranslationSource;
  name_de_source: TranslationSource;
  name_fr_source: TranslationSource;
  display_order: number;
  is_active: boolean;
}

export interface AdminStyle {
  id: string;
  slug: string;
  category_id: string | null;
  name_en: string;
  name_de: string | null;
  name_fr: string | null;
  name_en_source: TranslationSource;
  name_de_source: TranslationSource;
  name_fr_source: TranslationSource;
  description_en: string | null;
  description_de: string | null;
  description_fr: string | null;
  description_en_source: TranslationSource;
  description_de_source: TranslationSource;
  description_fr_source: TranslationSource;
  is_active: boolean;
  images: StyleImage[];
  variations: StyleVariation[];
}

export interface AdminAddon {
  id: string;
  slug: string;
  name_en: string;
  name_de: string | null;
  name_fr: string | null;
  name_en_source: TranslationSource;
  name_de_source: TranslationSource;
  name_fr_source: TranslationSource;
  suggested_price: string | null;
  is_active: boolean;
}

// ---------------------------------------------------------------------------
// Admin platform settings
// ---------------------------------------------------------------------------

export type SettingValueType = "PERCENTAGE" | "FIXED";

export interface PlatformSettings {
  id: string;
  platform_fee_type: SettingValueType;
  platform_fee_value: string;
  vat_type: SettingValueType;
  vat_value: string;
  vat_platform_fee_type: SettingValueType;
  vat_platform_fee_value: string;
  deposit_type: SettingValueType;
  deposit_value: string;
}

export interface PlatformSettingsUpdateRequest {
  platform_fee_type?: SettingValueType | null;
  platform_fee_value?: string | number | null;
  vat_type?: SettingValueType | null;
  vat_value?: string | number | null;
  vat_platform_fee_type?: SettingValueType | null;
  vat_platform_fee_value?: string | number | null;
  deposit_type?: SettingValueType | null;
  deposit_value?: string | number | null;
}

export interface CountryVatSettings {
  country: string;
  vat_type: SettingValueType;
  vat_value: string;
  vat_platform_fee_type: SettingValueType;
  vat_platform_fee_value: string;
}

export interface CountryVatUpsertRequest {
  vat_type: SettingValueType;
  vat_value: string | number;
  vat_platform_fee_type: SettingValueType;
  vat_platform_fee_value: string | number;
}

// ---------------------------------------------------------------------------
// Admin chat reports
// ---------------------------------------------------------------------------

export type ChatReportReason =
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "SCAM_OR_FRAUD"
  | "OFF_PLATFORM_SOLICITATION"
  | "OTHER";

export type ChatReportStatus =
  | "OPEN"
  | "UNDER_REVIEW"
  | "RESOLVED"
  | "DISMISSED";

export interface AdminChatReport {
  id: string;
  thread_id: string;
  booking_id: string;
  reporter_id: string;
  reporter_name: string;
  reported_user_id: string;
  reported_user_name: string;
  message_id: string | null;
  reason: ChatReportReason;
  details: string | null;
  status: ChatReportStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatReportsListParams {
  status?: ChatReportStatus;
  page?: number;
  page_size?: number;
}

export interface ChatReportUpdateRequest {
  status: ChatReportStatus;
  admin_notes?: string | null;
}

// ---------------------------------------------------------------------------
// Admin reviews
// ---------------------------------------------------------------------------

export type ReviewStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface AdminReview {
  id: string;
  braider_id: string;
  braider_name: string;
  customer_id: string;
  customer_name: string;
  rating: number;
  comment_en: string | null;
  comment_de: string | null;
  comment_fr: string | null;
  status: ReviewStatus;
  created_at: string;
  updated_at: string;
}

export interface ReviewsListParams {
  status?: ReviewStatus;
  page?: number;
  page_size?: number;
}

export type NotificationType = "CHAT_NEW_MESSAGE" | "CHAT_MESSAGE_FLAGGED";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  related_type: string | null;
  related_id: string | null;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationListParams {
  is_read?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

// ---------------------------------------------------------------------------
// Realtime (WebSocket) event payloads
// ---------------------------------------------------------------------------

export interface RealtimeNotificationEvent {
  type: "notification";
  notification: Notification;
}

export type RealtimeEvent = RealtimeNotificationEvent;
