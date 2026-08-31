export type EmailProvider = 'CONSOLE' | 'RESEND' | 'SMTP'
export type EmailDeliveryStatus = 'PENDING' | 'SENT' | 'FAILED'

export interface EmailResult {
  success: boolean
  messageId?: string
  status: EmailDeliveryStatus
  provider: EmailProvider
  error?: string
  timestamp: Date
}

export interface UserBookingConfirmationParams {
  toEmail: string
  userName: string
  propertyName: string
  propertyAddress: string
  roomNumber: string
  bedIdentifier: string
  bookingId: string
  transactionId: string
  amount: number
  moveInDate: string
  durationMonths?: number
}

export interface OwnerNewBookingParams {
  ownerEmail: string
  ownerName: string
  residentName: string
  residentEmail: string
  residentPhone?: string
  propertyName: string
  roomNumber: string
  bedIdentifier: string
  bookingId: string
  transactionId: string
  amount: number
  ownerPayout: number
  moveInDate: string
}

export interface PGVerificationSubmittedParams {
  ownerEmail: string
  ownerName: string
  propertyName: string
  propertyLocation: string
}

export interface PGVerificationApprovedParams {
  ownerEmail: string
  ownerName: string
  propertyName: string
  propertyId: string
}

export interface PGVerificationActionRequiredParams {
  ownerEmail: string
  ownerName: string
  propertyName: string
  reason?: string
}

export interface SuperAdminPGAlertParams {
  adminEmail: string
  ownerName: string
  propertyName: string
  location: string
  propertyId: string
}

export interface ComplaintNotificationParams {
  recipientEmail: string
  recipientName: string
  propertyName: string
  complaintTitle: string
  category: string
  slaDeadline: Date
  isOwner: boolean
}

export interface PhoneOTPVerificationParams {
  toEmail: string
  userName: string
  phone: string
  otp: string
  isDemoMode?: boolean
}

export interface IdentityVerificationApprovedParams {
  toEmail: string
  userName: string
  documentType: string
  approvalDate: string
}

export interface IdentityVerificationRejectedParams {
  toEmail: string
  userName: string
  documentType: string
  rejectionReason: string
}

export interface InventoryAgreementCreatedParams {
  ownerEmail: string
  ownerName: string
  propertyName: string
  propertyId: string
  bedCount: number
  agreementStartDate: string
  agreementEndDate?: string
  dashboardUrl: string
}

export interface InventoryAgreementAcceptedParams {
  ownerEmail: string
  ownerName: string
  propertyName: string
  bedCount: number
  dashboardUrl: string
}

export interface EmailService {
  readonly provider: EmailProvider
  sendBookingConfirmationToUser(params: UserBookingConfirmationParams): Promise<EmailResult>
  sendNewBookingNotificationToOwner(params: OwnerNewBookingParams): Promise<EmailResult>
  sendPGVerificationSubmitted(params: PGVerificationSubmittedParams): Promise<EmailResult>
  sendPGApproved(params: PGVerificationApprovedParams): Promise<EmailResult>
  sendPGActionRequired(params: PGVerificationActionRequiredParams): Promise<EmailResult>
  sendSuperAdminPGAlert(params: SuperAdminPGAlertParams): Promise<EmailResult>
  sendComplaintNotification(params: ComplaintNotificationParams): Promise<EmailResult>
  sendPhoneOTPVerification(params: PhoneOTPVerificationParams): Promise<EmailResult>
  sendIdentityVerificationApproved(params: IdentityVerificationApprovedParams): Promise<EmailResult>
  sendIdentityVerificationRejected(params: IdentityVerificationRejectedParams): Promise<EmailResult>
  sendInventoryAgreementCreated(params: InventoryAgreementCreatedParams): Promise<EmailResult>
  sendInventoryAgreementAccepted(params: InventoryAgreementAcceptedParams): Promise<EmailResult>
}
