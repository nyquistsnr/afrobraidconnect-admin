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

export interface SignupEmailRequest {
  first_name: string;
  last_name?: string;
  email: string;
  phone_number?: string;
  password: string;
  user_type: "CUSTOMER" | "BRAIDER";
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  remember_me?: boolean;
}

export type SocialProvider = "google" | "facebook" | "tiktok";

export interface SocialLoginRequest {
  provider_token: string;
  user_type?: "CUSTOMER" | "BRAIDER";
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
// Braider onboarding
// ---------------------------------------------------------------------------

export type Gender = "MALE" | "FEMALE" | "OTHER" | "PREFER_NOT_TO_SAY";

export type BioSource = "HUMAN" | "MACHINE" | "PENDING" | "FAILED";

export interface BusinessInfoResponse {
  business_name: string | null;
  logo_url: string | null;
  bio_en: string | null;
  bio_de: string | null;
  bio_fr: string | null;
  bio_en_source: BioSource | null;
  bio_de_source: BioSource | null;
  bio_fr_source: BioSource | null;
  gender: Gender | null;
  is_complete: boolean;
}

export interface BusinessInfoUpdateRequest {
  business_name?: string;
  bio?: string;
  gender?: Gender;
}

export type LogoContentType = "image/jpeg" | "image/png" | "image/webp";

export interface LogoUploadUrlRequest {
  content_type: LogoContentType;
}

export interface LogoUploadUrlResponse {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

export interface LogoConfirmRequest {
  object_key: string;
}

export interface SendCodeRequest {
  phone_number: string;
}

export interface SendCodeResponse {
  status: string;
  phone_number: string;
}

export interface VerifyCodeRequest {
  phone_number: string;
  code: string;
}

export interface VerifyCodeResponse {
  status: string;
  is_complete: boolean;
}

export interface PhoneVerificationStatusResponse {
  phone_number: string | null;
  is_verified: boolean;
}

export interface OnboardingStatusResponse {
  current_step: OnboardingStep;
  business_info_completed_at: string | null;
  phone_verification_completed_at: string | null;
  veriff_completed_at: string | null;
  service_type_completed_at: string | null;
  portfolio_completed_at: string | null;
  service_location_completed_at: string | null;
  availability_completed_at: string | null;
  payment_setup_completed_at: string | null;
  completed_at: string | null;
}

export type VeriffSessionStatus =
  | "CREATED"
  | "SUBMITTED"
  | "APPROVED"
  | "DECLINED"
  | "RESUBMISSION_REQUESTED"
  | "REVIEW"
  | "EXPIRED"
  | "ABANDONED";

export interface StartVerificationResponse {
  session_id: string;
  verification_url: string;
  status: VeriffSessionStatus;
  status_label: string;
}

export interface VeriffStatusResponse {
  has_session: boolean;
  session_id: string | null;
  verification_url: string | null;
  status: VeriffSessionStatus | null;
  status_label: string;
  reason: string | null;
  reason_code: number | null;
  acceptance_time: string | null;
  submission_time: string | null;
  decision_time: string | null;
  is_complete: boolean;
}

// ---------------------------------------------------------------------------
// Portfolio
// ---------------------------------------------------------------------------

export type PortfolioImageContentType = "image/jpeg" | "image/png" | "image/webp";

export interface PortfolioImageResponse {
  id: string;
  url: string;
  caption_en: string | null;
  caption_de: string | null;
  caption_fr: string | null;
  caption_en_source: BioSource | null;
  caption_de_source: BioSource | null;
  caption_fr_source: BioSource | null;
  position: number;
}

export interface PortfolioResponse {
  images: PortfolioImageResponse[];
  min_required: number;
  is_complete: boolean;
}

export interface PortfolioImageUploadUrlRequest {
  content_type: PortfolioImageContentType;
}

export interface PortfolioImageUploadUrlResponse {
  upload_url: string;
  object_key: string;
  expires_in: number;
}

export interface PortfolioImageConfirmRequest {
  object_key: string;
  caption?: string;
}

export interface PortfolioImageUpdateRequest {
  caption?: string | null;
}

// ---------------------------------------------------------------------------
// Service Location
// ---------------------------------------------------------------------------

export type LocationType = "HOME_STUDIO" | "SALON";

export interface ServiceLocationUpdateRequest {
  location_type?: LocationType | null;
  salon_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  postal_code?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  offers_mobile?: boolean;
  travel_radius_km?: number | null;
  travel_fee?: number | null;
}

export interface ServiceLocationResponse {
  location_type: LocationType | null;
  salon_name: string | null;
  address_line1: string | null;
  address_line2: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  latitude: number | null;
  longitude: number | null;
  offers_mobile: boolean;
  travel_radius_km: number | null;
  travel_fee: number | null;
  is_complete: boolean;
}

// ---------------------------------------------------------------------------
// Availability
// ---------------------------------------------------------------------------

export type DayOfWeek = "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
export type AvailabilityExceptionType = "CLOSED" | "CUSTOM_HOURS";

export interface AvailabilitySettingsResponse {
  timezone: string;
  min_notice_hours: number;
  max_advance_days: number;
  buffer_minutes: number;
}

export interface AvailabilitySettingsUpdateRequest {
  timezone?: string;
  min_notice_hours?: number;
  max_advance_days?: number;
  buffer_minutes?: number;
}

export interface WeeklyWindowResponse {
  id: string;
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface WeeklyWindowCreateRequest {
  day_of_week: DayOfWeek;
  start_time: string;
  end_time: string;
}

export interface WeeklyWindowUpdateRequest {
  start_time?: string;
  end_time?: string;
  is_active?: boolean;
}

export interface AvailabilityExceptionResponse {
  id: string;
  date: string;
  exception_type: AvailabilityExceptionType;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
}

export interface AvailabilityExceptionCreateRequest {
  date: string;
  exception_type: AvailabilityExceptionType;
  start_time?: string;
  end_time?: string;
  reason?: string;
}

export interface AvailableSlotResponse {
  start_at: string;
  end_at: string;
}

// ---------------------------------------------------------------------------
// Payment Setup (Stripe Connect)
// ---------------------------------------------------------------------------

export interface AccountLinkResponse {
  onboarding_url: string;
}

export interface DashboardLinkResponse {
  dashboard_url: string;
}

export interface PaymentSetupStatusResponse {
  has_account: boolean;
  stripe_account_id: string | null;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  disabled_reason: string | null;
  requirements_currently_due: string[];
  is_complete: boolean;
}

// ---------------------------------------------------------------------------
// Style catalog (public, locale-resolved via Accept-Language) + braider menu
// ---------------------------------------------------------------------------

export interface StyleCategoryPublicResponse {
  id: string;
  slug: string;
  name: string;
  display_order: number;
}

export interface StyleImageResponse {
  id: string;
  url: string;
  position: number;
}

export interface StyleVariationPublicResponse {
  id: string;
  name: string;
  display_order: number;
  is_active: boolean;
}

export interface StylePublicResponse {
  id: string;
  slug: string;
  category_id: string | null;
  name: string;
  description: string | null;
  is_active: boolean;
  images: StyleImageResponse[];
  variations: StyleVariationPublicResponse[];
}

export interface AddOnPublicResponse {
  id: string;
  slug: string;
  name: string;
  suggested_price: number | null;
  is_active: boolean;
}

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

export interface BraiderStyleVariationInput {
  style_variation_id: string;
  price: number;
}

export interface BraiderStyleAddonInput {
  addon_id: string;
  price: number;
  is_required?: boolean;
}

export interface BraiderStyleCreateRequest {
  style_id: string;
  base_price: number;
  duration_minutes?: number;
  variations?: BraiderStyleVariationInput[];
  addons?: BraiderStyleAddonInput[];
}

export interface BraiderStyleUpdateRequest {
  base_price?: number;
  duration_minutes?: number;
  is_active?: boolean;
  variations?: BraiderStyleVariationInput[];
  addons?: BraiderStyleAddonInput[];
}

export interface BraiderStyleVariationResponse {
  id: string;
  style_variation_id: string;
  price: number;
}

export interface BraiderStyleAddonResponse {
  id: string;
  addon_id: string;
  price: number;
  is_required: boolean;
}

export interface BraiderStyleResponse {
  id: string;
  style_id: string;
  style_slug: string;
  style_name_en: string;
  style_name_de: string | null;
  style_name_fr: string | null;
  primary_image_url: string | null;
  base_price: number;
  duration_minutes: number | null;
  is_active: boolean;
  variations: BraiderStyleVariationResponse[];
  addons: BraiderStyleAddonResponse[];
}

// ---------------------------------------------------------------------------
// Braider Bookings
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

export type PaymentSchedule = "FULL_UPFRONT" | "DEPOSIT_THEN_BALANCE";

export type PaymentPurpose = "FULL" | "DEPOSIT" | "BALANCE";

export type PaymentStatus = "PENDING" | "SUCCEEDED" | "FAILED" | "CANCELED";

export type BookingItemType =
  | "SERVICE"
  | "VARIATION"
  | "ADDON"
  | "TRAVEL"
  | "PLATFORM_FEE"
  | "VAT_SERVICE"
  | "VAT_PLATFORM_FEE";

export type Currency = "EUR";

export interface BookingListItemResponse {
  id: string;
  reference: string;
  status: BookingStatus;
  braider_id: string;
  braider_name: string;
  customer_name: string;
  style_name: string;
  starts_at: string;
  ends_at: string;
  total: string;
  currency: Currency;
}

// Note: pagination fields are flat here, not nested under `pagination` like
// PaginatedData<T> — this endpoint's envelope shape differs from the catalog
// endpoints.
export interface BookingListResponse {
  items: BookingListItemResponse[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface BookingListParams {
  status?: BookingStatus;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface BookingLineItemResponse {
  item_type: BookingItemType;
  name: string | null;
  quantity: number;
  unit_amount: string;
  line_amount: string;
  is_required: boolean;
}

export interface BookingPaymentResponse {
  purpose: PaymentPurpose;
  status: PaymentStatus;
  amount: string;
  currency: Currency;
  client_secret?: string | null;
}

export interface BookingDetailResponse {
  id: string;
  reference: string;
  status: BookingStatus;
  braider_id: string;
  braider_name: string;
  customer_name: string;
  style_id: string;
  style_name: string;
  duration_minutes: number;
  is_mobile: boolean;
  client_address: string | null;
  client_latitude: string | null;
  client_longitude: string | null;
  country: string;
  currency: Currency;
  starts_at: string;
  ends_at: string;
  items: BookingLineItemResponse[];
  service_subtotal: string;
  travel_fee: string;
  subtotal: string;
  platform_fee: string;
  vat_on_service: string;
  vat_on_platform_fee: string;
  vat_total: string;
  total: string;
  deposit_amount: string;
  balance_amount: string;
  payment_schedule: PaymentSchedule;
  cancellation_cutoff_at: string;
  payments: BookingPaymentResponse[];
  created_at: string;
}

// ---------------------------------------------------------------------------
// Braider Stats & Payments
// ---------------------------------------------------------------------------

export interface BookingStatsResponse {
  total_bookings: number;
  completed: number;
  declined: number;
  upcoming: number;
}

export interface TimeseriesPoint {
  bucket: string;
  counts: Partial<Record<BookingStatus, number>>;
}

export interface BookingTimeseriesResponse {
  interval: "day" | "week" | "month";
  statuses: BookingStatus[];
  points: TimeseriesPoint[];
}

export interface PaymentStatsResponse {
  total_received: string;
  total_refunded: string;
  net_revenue: string;
  pending: string;
  currency: Currency;
}

export interface PaymentListItemResponse {
  id: string;
  booking_id: string;
  booking_reference: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  amount: string;
  amount_refunded: string;
  is_refunded: boolean;
  currency: Currency;
  created_at: string;
}

export interface PaymentListResponse {
  items: PaymentListItemResponse[];
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

// ---------------------------------------------------------------------------
// Chat & Notifications
// ---------------------------------------------------------------------------

export interface ChatThread {
  id: string;
  booking_id: string;
  other_participant_id: string;
  other_participant_name: string;
  last_message_at: string | null;
  last_message_preview: string | null;
  last_message_flagged: boolean;
  unread_count: number;
  created_at: string;
}

export type ChatMessageStatus = "SENT" | "FLAGGED";

export interface ChatMessage {
  id: string;
  thread_id: string;
  sender_id: string;
  status: ChatMessageStatus;
  // Always null when status is FLAGGED — the platform never stores the
  // plaintext of a message that looks like it shares contact/payment info.
  body: string | null;
  body_locale: string | null;
  translated_body: string | null;
  translated_locale: string | null;
  violation_notice: string | null;
  created_at: string;
}

export interface SendChatMessageRequest {
  body: string;
}

export type ChatReportReason =
  | "HARASSMENT"
  | "INAPPROPRIATE_CONTENT"
  | "SPAM"
  | "SCAM_OR_FRAUD"
  | "OFF_PLATFORM_SOLICITATION"
  | "OTHER";

export interface ChatReportRequest {
  reason: ChatReportReason;
  details?: string | null;
  message_id?: string | null;
}

export interface ChatReportResponse {
  id: string;
  thread_id: string;
  reported_user_id: string;
  reason: ChatReportReason;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "DISMISSED";
  created_at: string;
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

export interface RealtimeChatMessageEvent {
  type: "chat_message";
  thread_id: string;
  message: ChatMessage;
}

export interface RealtimeChatMessageTranslatedEvent {
  type: "chat_message_translated";
  thread_id: string;
  message_id: string;
  translated_body: string;
  translated_locale: string;
}

export interface RealtimeNotificationEvent {
  type: "notification";
  notification: Notification;
}

export type RealtimeEvent =
  | RealtimeChatMessageEvent
  | RealtimeChatMessageTranslatedEvent
  | RealtimeNotificationEvent;

// ---------------------------------------------------------------------------
// Braider Dashboard
// ---------------------------------------------------------------------------

export interface DashboardOverviewResponse {
  total_bookings: number;
  completed_bookings: number;
  upcoming_bookings: number;
  cancelled_bookings: number;
  no_show_bookings: number;
  completion_rate: string;
  cancellation_rate: string;
  total_revenue: string;
  average_booking_value: string;
  unique_customers: number;
  repeat_customers: number;
  repeat_customer_rate: string;
  average_rating: string;
  rating_count: number;
  currency: Currency;
}

export interface DashboardRevenueTimeseriesPoint {
  bucket: string;
  revenue: string;
  bookings_count: number;
}

export interface DashboardRevenueTimeseriesResponse {
  interval: "day" | "week" | "month";
  currency: Currency;
  points: DashboardRevenueTimeseriesPoint[];
}

export interface DashboardBusiestDaysPoint {
  weekday: number;
  bookings_count: number;
  revenue: string;
}

export interface DashboardBookingsByWeekdayResponse {
  currency: Currency;
  points: DashboardBusiestDaysPoint[];
}

export interface DashboardStyleSlice {
  style_id: string | null;
  style_name: string;
  bookings_count: number;
  revenue: string;
  revenue_share: string;
}

export interface DashboardStyleBreakdownResponse {
  currency: Currency;
  total_revenue: string;
  slices: DashboardStyleSlice[];
}
