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
  braider_id?: string | null;
  braider_profile_id?: string | null;
  profile_id?: string | null;
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
// Admin Contact Submissions
// ---------------------------------------------------------------------------

export type ContactSubmissionPlatform = "CUSTOMER" | "BRAIDER";
export type ContactSubmissionPurpose = "GENERAL" | "PARTNER" | "PRICING" | "FAQS";

export interface AdminContactSubmission {
  id: string;
  first_name: string;
  last_name: string | null;
  phone_number: string | null;
  email: string;
  subject: string | null;
  message: string;
  platform: ContactSubmissionPlatform;
  purpose: ContactSubmissionPurpose | null;
  is_read: boolean;
  read_at: string | null;
  read_by_admin_id: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface AdminContactSubmissionsListParams {
  platform?: ContactSubmissionPlatform;
  purpose?: ContactSubmissionPurpose;
  is_read?: boolean;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
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

// ---------------------------------------------------------------------------
// Admin bookings and payments
// ---------------------------------------------------------------------------

export type BookingStatus =
  | "PENDING_PAYMENT"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "NO_SHOW"
  | "CANCELLED_BY_CUSTOMER"
  | "CANCELLED_BY_BRAIDER"
  | "CANCELLED_NO_PAYMENT"
  | "EXPIRED"
  | "DISPUTED";

export type Currency = "EUR" | "GBP" | "USD" | string;

export type PaymentSchedule = "FULL_UPFRONT" | "DEPOSIT_THEN_BALANCE";

export type PaymentPurpose = "FULL" | "DEPOSIT" | "BALANCE";

export type PaymentStatus =
  | "PENDING"
  | "SUCCEEDED"
  | "FAILED"
  | "CANCELED"
  | "PROCESSING"
  | "REQUIRES_ACTION"
  | "REFUNDED";

export interface AdminBookingsListParams {
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  created_from?: string;
  created_to?: string;
  customer_id?: string;
  braider_id?: string;
  country?: string;
  currency?: Currency;
  is_mobile?: boolean;
  payment_schedule?: PaymentSchedule;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AdminBookingStatsParams
  extends Omit<AdminBookingsListParams, "page" | "page_size" | "customer_id" | "braider_id"> {
  payment_date_from?: string;
  payment_date_to?: string;
}

export type AdminRevenueChartInterval = "day" | "week" | "month";

export interface AdminBookingChartParams extends AdminBookingStatsParams {
  interval?: AdminRevenueChartInterval;
  limit?: number;
}

export interface AdminDashboardFilters {
  date_from?: string;
  date_to?: string;
  created_from?: string;
  created_to?: string;
  payment_date_from?: string;
  payment_date_to?: string;
  country?: string;
  currency?: Currency;
  is_mobile?: boolean;
  payment_schedule?: PaymentSchedule;
  search?: string;
  status?: BookingStatus;
}

export interface AdminDashboardChartParams
  extends Omit<
    AdminDashboardFilters,
    "created_from" | "created_to" | "payment_date_from" | "payment_date_to" | "status"
  > {
  interval?: AdminRevenueChartInterval;
  limit?: number;
}

export interface AdminDashboardOverview extends AdminBookingStats {
  unique_customer_count?: number | string | null;
  repeat_customer_count?: number | string | null;
  unique_braider_count?: number | string | null;
  repeat_braider_count?: number | string | null;
}

export interface AdminDashboardFinancials extends AdminBookingStats {
  gross_booking_value_minor?: number | string | null;
  gross_margin_before_tax_minor?: number | string | null;
  estimated_profit_after_vat_minor?: number | string | null;
}

export interface AdminBookingStats {
  total_bookings?: number;
  counts_by_status?: Partial<Record<BookingStatus | string, number>>;
  per_status_counts?: Partial<Record<BookingStatus | string, number>>;
  status_counts?: Partial<Record<BookingStatus | string, number>>;
  completed_count?: number;
  completed_bookings?: number;
  upcoming_count?: number;
  upcoming_bookings?: number;
  declined_count?: number;
  declined_bookings?: number;
  pending_count?: number;
  pending_payment_bookings?: number;
  no_show_count?: number;
  no_show_bookings?: number;
  disputed_count?: number;
  disputed_bookings?: number;
  mobile_count?: number;
  mobile_bookings?: number;
  salon_count?: number;
  salon_bookings?: number;
  unique_counterpart_count?: number;
  unique_customers?: number;
  unique_braiders?: number;
  repeat_counterpart_count?: number;
  repeat_customers?: number;
  repeat_braiders?: number;
  total_booking_value_minor?: number | string | null;
  total_booking_value?: number | string | null;
  average_booking_value_minor?: number | string | null;
  average_booking_value?: number | string | null;
  service_subtotal_minor?: number | string | null;
  service_subtotal?: number | string | null;
  platform_fee_total_minor?: number | string | null;
  platform_fee_total?: number | string | null;
  vat_total_minor?: number | string | null;
  vat_total?: number | string | null;
  paid_amount_minor?: number | string | null;
  paid_amount?: number | string | null;
  total_amount_paid?: number | string | null;
  refunded_amount_minor?: number | string | null;
  refunded_amount?: number | string | null;
  total_amount_refunded?: number | string | null;
  net_amount_minor?: number | string | null;
  net_amount?: number | string | null;
  net_amount_paid?: number | string | null;
  pending_payment_amount_minor?: number | string | null;
  pending_payment_amount?: number | string | null;
  braider_earnings_minor?: number | string | null;
  braider_earnings?: number | string | null;
  total_amount_made_by_braider?: number | string | null;
  customer_spend_minor?: number | string | null;
  customer_spend?: number | string | null;
  total_amount_spent_by_customer?: number | string | null;
  currency?: Currency | null;
  [key: string]: unknown;
}

export interface AdminChartPoint {
  label?: string | null;
  name?: string | null;
  date?: string | null;
  period?: string | null;
  weekday?: string | number | null;
  status?: BookingStatus | string | null;
  style_name?: string | null;
  value?: number | string | null;
  count?: number | string | null;
  amount?: number | string | null;
  amount_minor?: number | string | null;
  value_minor?: number | string | null;
  revenue_minor?: number | string | null;
  earnings_minor?: number | string | null;
  spend_minor?: number | string | null;
  currency?: Currency | null;
  [key: string]: unknown;
}

export interface AdminChartResponse {
  items?: AdminChartPoint[];
  points?: AdminChartPoint[];
  data?: AdminChartPoint[];
  slices?: AdminChartPoint[];
  currency?: Currency | null;
  [key: string]: unknown;
}

export type AdminOnboardingStep =
  | "BUSINESS_INFO"
  | "PHONE_VERIFICATION"
  | "VERIFF"
  | "SERVICE_TYPE"
  | "PORTFOLIO"
  | "SERVICE_LOCATION"
  | "AVAILABILITY"
  | "PAYMENT_SETUP";

export interface AdminBraiderOnboardingStep {
  step: AdminOnboardingStep | string;
  completed: boolean;
  completed_at: string | null;
}

export interface AdminBraiderOnboarding {
  braider_id?: string;
  current_step: AdminOnboardingStep | string | null;
  completed_at: string | null;
  steps: AdminBraiderOnboardingStep[];
}

export interface AdminPaymentsListParams {
  purpose?: PaymentPurpose;
  status?: PaymentStatus;
  date_from?: string;
  date_to?: string;
  booking_date_from?: string;
  booking_date_to?: string;
  customer_id?: string;
  braider_id?: string;
  booking_id?: string;
  currency?: Currency;
  is_refunded?: boolean;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface AdminBookingListItem {
  id: string;
  reference?: string | null;
  booking_reference?: string | null;
  status: BookingStatus;
  style_name?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  braider_id?: string | null;
  braider_name?: string | null;
  braider_business_name?: string | null;
  braider_email?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  created_at: string;
  country?: string | null;
  currency: Currency;
  is_mobile?: boolean | null;
  payment_schedule?: PaymentSchedule | null;
  total_amount_minor?: number | string | null;
  total_minor?: number | string | null;
  amount_total_minor?: number | string | null;
}

export interface AdminBookingItem {
  id: string;
  type?: string | null;
  label?: string | null;
  name?: string | null;
  quantity?: number | null;
  amount_minor?: number | string | null;
  total_amount_minor?: number | string | null;
  currency?: Currency | null;
}

export interface AdminBookingPayment {
  id: string;
  purpose?: PaymentPurpose | string | null;
  status?: PaymentStatus | string | null;
  amount_minor?: number | string | null;
  amount_refunded_minor?: number | string | null;
  currency?: Currency | null;
  stripe_payment_intent_id?: string | null;
  stripe_charge_id?: string | null;
  failure_code?: string | null;
  failure_message?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface AdminBookingDetail extends AdminBookingListItem {
  customer_first_name?: string | null;
  customer_last_name?: string | null;
  braider_first_name?: string | null;
  braider_last_name?: string | null;
  timezone?: string | null;
  duration_minutes?: number | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  latitude?: number | string | null;
  longitude?: number | string | null;
  service_subtotal_minor?: number | string | null;
  travel_fee_minor?: number | string | null;
  subtotal_minor?: number | string | null;
  platform_fee_minor?: number | string | null;
  vat_service_minor?: number | string | null;
  vat_platform_fee_minor?: number | string | null;
  vat_total_minor?: number | string | null;
  deposit_amount_minor?: number | string | null;
  balance_amount_minor?: number | string | null;
  cancellation_cutoff_at?: string | null;
  cancelled_at?: string | null;
  confirmed_at?: string | null;
  completed_at?: string | null;
  expired_at?: string | null;
  updated_at?: string | null;
  items?: AdminBookingItem[];
  booking_items?: AdminBookingItem[];
  payments?: AdminBookingPayment[];
}

export interface AdminPaymentListItem extends AdminBookingPayment {
  booking_id: string;
  booking_reference?: string | null;
  booking_status?: BookingStatus | string | null;
  booking_starts_at?: string | null;
  customer_id?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  braider_id?: string | null;
  braider_name?: string | null;
  braider_business_name?: string | null;
  braider_email?: string | null;
  is_mobile?: boolean | null;
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
