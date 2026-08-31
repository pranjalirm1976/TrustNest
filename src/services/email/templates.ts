import {
  UserBookingConfirmationParams,
  OwnerNewBookingParams,
  PGVerificationSubmittedParams,
  PGVerificationApprovedParams,
  PGVerificationActionRequiredParams,
  SuperAdminPGAlertParams,
  ComplaintNotificationParams
} from './types'

function baseEmailWrapper(title: string, contentHtml: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #1e293b; margin: 0; padding: 24px; }
    .card { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: #0f172a; color: #ffffff; padding: 24px 32px; text-align: left; }
    .header h1 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { margin: 4px 0 0 0; font-size: 12px; color: #94a3b8; }
    .body { padding: 32px; }
    .highlight-box { background: #f1f5f9; border-radius: 12px; padding: 16px 20px; margin: 20px 0; border: 1px solid #e2e8f0; font-size: 13px; }
    .table-row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #e2e8f0; }
    .table-row:last-child { border-bottom: none; }
    .label { color: #64748b; font-weight: 500; }
    .value { color: #0f172a; font-weight: 700; text-align: right; }
    .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 20px 32px; font-size: 11px; color: #94a3b8; text-align: center; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 13px; margin-top: 16px; }
    .tag { display: inline-block; padding: 4px 8px; border-radius: 6px; font-size: 10px; font-weight: 800; text-transform: uppercase; }
    .tag-success { background: #dcfce7; color: #15803d; }
    .tag-demo { background: #fef3c7; color: #92400e; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1>TRUSTNEST</h1>
      <p>Verified Co-Living &amp; Student Housing Platform</p>
    </div>
    <div class="body">
      ${contentHtml}
    </div>
    <div class="footer">
      <p>&copy; 2026 TrustNest Technologies Pvt. Ltd. • Zero Commission Student Housing</p>
      <p>Need support? Contact support@trustnest.in</p>
    </div>
  </div>
</body>
</html>
`
}

export function generateUserBookingConfirmationEmail(params: UserBookingConfirmationParams): { subject: string; html: string; text: string } {
  const subject = `TrustNest Booking Confirmed — ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">TrustNest Booking Confirmed! 🎉</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.userName}</strong>,<br>
      Your TrustNest booking has been successfully confirmed.
    </p>

    <div class="highlight-box">
      <div style="margin-bottom: 12px;"><span class="tag tag-success">Payment Status: SUCCESS</span></div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b;">PG:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Address:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyAddress}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Room:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Room ${params.roomNumber}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Bed:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Bed ${params.bedIdentifier}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Move-in Date:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.moveInDate}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${params.bookingId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${params.transactionId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment Status:</td><td style="text-align: right; font-weight: bold; color: #15803d;">SUCCESS</td></tr>
        <tr><td style="padding: 8px 0 0 0; color: #0f172a; font-weight: bold;">Amount Paid:</td><td style="padding: 8px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #0f172a;">₹${params.amount.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      For assistance, contact TrustNest Support: <strong style="color: #4f46e5;">support@trustnest.in</strong>
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://trust-nest-one.vercel.app/tenant/dashboard" class="btn">View Resident Dashboard &rarr;</a>
    </div>
    `
  )

  const text = `
Hello ${params.userName},

Your TrustNest booking has been successfully confirmed.

Booking Details:

PG: ${params.propertyName}
Address: ${params.propertyAddress}
Room: ${params.roomNumber}
Bed: ${params.bedIdentifier}
Move-in Date: ${params.moveInDate}
Booking ID: ${params.bookingId}
Payment ID: ${params.transactionId}
Amount Paid: ₹${params.amount}
Payment Status: SUCCESS

For assistance: support@trustnest.in
`
  return { subject, html, text }
}

export function generateOwnerNewBookingEmail(params: OwnerNewBookingParams): { subject: string; html: string; text: string } {
  const subject = `New TrustNest Booking — ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">New TrustNest Booking Received 🔔</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.ownerName}</strong>,<br>
      A new resident has successfully booked a TrustNest bed in your PG.
    </p>

    <div class="highlight-box">
      <div style="margin-bottom: 12px;"><span class="tag tag-success">Payment Status: SUCCESS</span></div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b;">Resident:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Resident Email:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentEmail}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Verified Mobile:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentPhone || 'Verified in App'}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">PG:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Room:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Room ${params.roomNumber}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Bed:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Bed ${params.bedIdentifier}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Move-in Date:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.moveInDate}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking ID:</td><td style="text-align: right; font-family: monospace;">${params.bookingId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment ID:</td><td style="text-align: right; font-family: monospace;">${params.transactionId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment Status:</td><td style="text-align: right; font-weight: bold; color: #15803d;">SUCCESS</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Amount:</td><td style="text-align: right; font-weight: bold;">₹${params.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding: 8px 0 0 0; color: #15803d; font-weight: bold;">Net Owner Payout:</td><td style="padding: 8px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #15803d;">₹${params.ownerPayout.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://trust-nest-one.vercel.app/admin/tenants" class="btn">View Booking &rarr;</a>
    </div>
    `
  )

  const text = `
Hello ${params.ownerName},

A new resident has successfully booked a TrustNest bed in your PG.

Booking Details:

Resident: ${params.residentName}
Resident Email: ${params.residentEmail}
Verified Mobile: ${params.residentPhone || 'Verified in App'}
PG: ${params.propertyName}
Room: ${params.roomNumber}
Bed: ${params.bedIdentifier}
Move-in Date: ${params.moveInDate}
Booking ID: ${params.bookingId}
Payment ID: ${params.transactionId}
Amount: ₹${params.amount}
Payment Status: SUCCESS

View Booking: https://trust-nest-one.vercel.app/admin/tenants
`
  return { subject, html, text }
}

export function generateSuperAdminNewBookingEmail(params: import('./types').SuperAdminNewBookingParams): { subject: string; html: string; text: string } {
  const subject = `TrustNest — New Booking Recorded`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">New Booking Recorded 📈</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      A new TrustNest booking has been successfully recorded.
    </p>

    <div class="highlight-box">
      <div style="margin-bottom: 12px;"><span class="tag tag-success">Payment Status: SUCCESS</span></div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b;">PG:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Owner:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.ownerName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Resident:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Room:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Room ${params.roomNumber}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Bed:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Bed ${params.bedIdentifier}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking ID:</td><td style="text-align: right; font-family: monospace;">${params.bookingId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment ID:</td><td style="text-align: right; font-family: monospace;">${params.transactionId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Amount:</td><td style="text-align: right; font-weight: bold;">₹${params.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Payment Status:</td><td style="text-align: right; font-weight: bold; color: #15803d;">SUCCESS</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking Date:</td><td style="text-align: right; font-weight: bold;">${params.bookingDate}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Move-in Date:</td><td style="text-align: right; font-weight: bold;">${params.moveInDate}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="https://trust-nest-one.vercel.app/super-admin" class="btn">View Booking &rarr;</a>
    </div>
    `
  )

  const text = `
A new TrustNest booking has been successfully recorded.

PG: ${params.propertyName}
Owner: ${params.ownerName}
Resident: ${params.residentName}
Room: ${params.roomNumber}
Bed: ${params.bedIdentifier}
Booking ID: ${params.bookingId}
Payment ID: ${params.transactionId}
Amount: ₹${params.amount}
Payment Status: SUCCESS
Booking Date: ${params.bookingDate}
Move-in Date: ${params.moveInDate}

View Booking: https://trust-nest-one.vercel.app/super-admin
`
  return { subject, html, text }
}

export function generatePGVerificationSubmittedEmail(params: PGVerificationSubmittedParams): { subject: string; html: string; text: string } {
  const subject = `Your PG has been submitted for TrustNest verification – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">PG Verification Submitted 📋</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.ownerName}</strong>,<br>
      Your property <strong>${params.propertyName}</strong> in ${params.propertyLocation} has been submitted for Super Admin review and verification.
    </p>
    <div class="highlight-box">
      <p style="margin: 0; font-size: 12px; color: #475569;">
        Our verification team is reviewing your room layouts, photos, and amenities. Once approved, your PG will be published to thousands of students and working professionals.
      </p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:3000/admin/subscription" class="btn">Manage Partner Subscription &rarr;</a>
    </div>
    `
  )
  const text = `Hello ${params.ownerName}, ${params.propertyName} has been submitted for TrustNest verification.`
  return { subject, html, text }
}

export function generatePGApprovedEmail(params: PGVerificationApprovedParams): { subject: string; html: string; text: string } {
  const subject = `Your PG has been approved – ${params.propertyName} is now LIVE! 🎉`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #15803d; margin-top: 0;">Congratulations! Your PG is Approved &amp; Published 🚀</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.ownerName}</strong>,<br>
      Great news! <strong>${params.propertyName}</strong> has passed Super Admin verification and is now live on TrustNest.
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/pg/${params.propertyId}" class="btn">View Live Listing &rarr;</a>
    </div>
    `
  )
  const text = `Hello ${params.ownerName}, your PG ${params.propertyName} has been approved and published on TrustNest!`
  return { subject, html, text }
}

export function generatePGActionRequiredEmail(params: PGVerificationActionRequiredParams): { subject: string; html: string; text: string } {
  const subject = `Action required for your PG registration – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #b91c1c; margin-top: 0;">Action Required for PG Verification ⚠️</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.ownerName}</strong>,<br>
      The verification team reviewed <strong>${params.propertyName}</strong> and requested updates before publishing.
    </p>
    <div class="highlight-box" style="border-left: 4px solid #ef4444;">
      <p style="margin: 0; font-size: 13px; font-weight: bold; color: #991b1b;">Reason / Feedback:</p>
      <p style="margin: 4px 0 0 0; font-size: 12px; color: #475569;">${params.reason || 'Please verify floor layout blueprints and ensure photos meet quality guidelines.'}</p>
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:3000/admin/verification" class="btn">Review &amp; Resubmit &rarr;</a>
    </div>
    `
  )
  const text = `Hello ${params.ownerName}, updates are required for ${params.propertyName}: ${params.reason}`
  return { subject, html, text }
}

export function generateSuperAdminPGAlertEmail(params: SuperAdminPGAlertParams): { subject: string; html: string; text: string } {
  const subject = `[Super Admin Alert] New PG Verification Request – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">New PG Pending Verification 🔔</h2>
    <p style="font-size: 13px; color: #475569;">
      <strong>Owner:</strong> ${params.ownerName}<br>
      <strong>Property:</strong> ${params.propertyName}<br>
      <strong>Location:</strong> ${params.location}
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/super-admin" class="btn">Open Super Admin Queue &rarr;</a>
    </div>
    `
  )
  const text = `Super Admin Alert: New PG ${params.propertyName} by ${params.ownerName} pending review at http://localhost:3000/super-admin`
  return { subject, html, text }
}

export function generateComplaintEmail(params: ComplaintNotificationParams): { subject: string; html: string; text: string } {
  const subject = `[TrustNest SLA Alert] New Complaint – ${params.propertyName} (${params.category})`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">24-Hour SLA Complaint Notice</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello <strong>${params.recipientName}</strong>,<br>
      A complaint has been filed regarding <strong>${params.propertyName}</strong>.
    </p>
    <div class="highlight-box">
      <strong>Category:</strong> ${params.category}<br>
      <strong>Issue:</strong> ${params.complaintTitle}<br>
      <strong>SLA Resolution Deadline:</strong> ${new Date(params.slaDeadline).toLocaleString('en-IN')}
    </div>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${params.isOwner ? 'http://localhost:3000/admin/complaints' : 'http://localhost:3000/tenant/complaints'}" class="btn">View Complaint Status &rarr;</a>
    </div>
    `
  )
  const text = `TrustNest Complaint: ${params.complaintTitle} at ${params.propertyName}. Deadline: ${params.slaDeadline}`
  return { subject, html, text }
}

export function generatePhoneOTPVerificationEmail(params: any): { subject: string; html: string; text: string } {
  const subject = `Your TrustNest Phone Verification OTP`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Phone Verification Required</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello ${params.userName},<br>
      Your phone verification code is ready!
    </p>
    <div class="highlight-box" style="text-align: center; background: ${params.isDemoMode ? '#fef3c7' : '#f1f5f9'}; border-left: 4px solid ${params.isDemoMode ? '#f59e0b' : '#3b82f6'};">
      <p style="margin: 0; font-size: 12px; color: #64748b;">Your One-Time Password (OTP)</p>
      <p style="margin: 12px 0 0 0; font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #0f172a; font-family: 'Courier New', monospace;">
        ${params.otp}
      </p>
      ${params.isDemoMode ? '<p style="margin: 8px 0 0 0; font-size: 11px; color: #92400e;">Demo Mode - No SMS Sent</p>' : ''}
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
      <strong>Phone:</strong> ${params.phone}<br>
      <strong>Valid for:</strong> 5 minutes
    </p>
    <p style="font-size: 12px; color: #94a3b8; margin-top: 16px;">
      If you didn't request this code, please ignore this email.
    </p>
    `
  )
  const text = `Your TrustNest OTP: ${params.otp}. Valid for 5 minutes. Phone: ${params.phone}. ${params.isDemoMode ? 'Demo Mode' : ''}`
  return { subject, html, text }
}

export function generateIdentityVerificationApprovedEmail(params: any): { subject: string; html: string; text: string } {
  const subject = `✓ Your Identity Verification is Approved`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #10b981; margin-top: 0;">✓ Verification Approved</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello ${params.userName},<br>
      Great news! Your identity verification has been approved.
    </p>
    <div class="highlight-box" style="background: #ecfdf5; border-left: 4px solid #10b981;">
      <p style="margin: 0; font-weight: bold; color: #065f46;">Document Verified ✓</p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #047857;">
        <strong>Document Type:</strong> ${params.documentType}<br>
        <strong>Approved on:</strong> ${params.approvalDate}
      </p>
    </div>
    <p style="font-size: 13px; color: #475569; margin-top: 16px;">
      Your account is now fully verified. You can proceed with bookings on TrustNest without any restrictions.
    </p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:3000/tenant" class="btn">Browse Properties &rarr;</a>
    </div>
    `
  )
  const text = `Your identity verification is approved! Document: ${params.documentType}. You can now book properties on TrustNest.`
  return { subject, html, text }
}

export function generateIdentityVerificationRejectedEmail(params: any): { subject: string; html: string; text: string } {
  const subject = `Identity Verification – Action Required`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #dc2626; margin-top: 0;">Identity Verification – Action Required</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello ${params.userName},<br>
      We couldn't verify your identity with the submitted document.
    </p>
    <div class="highlight-box" style="background: #fef2f2; border-left: 4px solid #dc2626;">
      <p style="margin: 0; font-weight: bold; color: #7f1d1d;">Document Rejected</p>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #991b1b;">
        <strong>Document Type:</strong> ${params.documentType}<br>
        <strong>Reason:</strong> ${params.rejectionReason}
      </p>
    </div>
    <p style="font-size: 13px; color: #475569; margin-top: 16px;">
      Please upload a clear, legible copy of your document and try again. Make sure:
    </p>
    <ul style="font-size: 12px; color: #475569; margin: 8px 0;">
      <li>All text is readable and not cut off</li>
      <li>The document is not expired</li>
      <li>The photo is clear and in good lighting</li>
    </ul>
    <div style="text-align: center; margin-top: 20px;">
      <a href="http://localhost:3000/auth/identity-verify" class="btn">Resubmit Document &rarr;</a>
    </div>
    `
  )
  const text = `Your identity verification was rejected. Reason: ${params.rejectionReason}. Please resubmit a clear document.`
  return { subject, html, text }
}

export function generateInventoryAgreementCreatedEmail(params: any): { subject: string; html: string; text: string } {
  const subject = `New Inventory Agreement Pending Review – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #4f46e5; margin-top: 0;">New Inventory Agreement</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello ${params.ownerName},<br>
      TrustNest has prepared an inventory allocation agreement for your property.
    </p>
    <div class="highlight-box">
      <p style="margin: 0;"><strong>Property:</strong> ${params.propertyName}</p>
      <p style="margin: 8px 0 0 0;"><strong>Allocated Beds:</strong> ${params.bedCount}</p>
      <p style="margin: 8px 0 0 0;"><strong>Agreement Period:</strong> ${params.agreementStartDate} to ${params.agreementEndDate || 'Ongoing'}</p>
    </div>
    <p style="font-size: 13px; color: #475569; margin-top: 16px; background: #ecfdf5; padding: 12px; border-radius: 8px; border-left: 4px solid #10b981;">
      <strong>Commission Split:</strong> 90% Owner / 10% TrustNest<br>
      Per successful booking
    </p>
    <p style="font-size: 13px; color: #475569; margin-top: 16px;">
      Please review and accept the agreement to make your beds available for bookings on TrustNest.
    </p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${params.dashboardUrl}" class="btn">Review Agreement &rarr;</a>
    </div>
    `
  )
  const text = `New inventory agreement for ${params.propertyName}: ${params.bedCount} beds allocated. Commission: 90% owner / 10% TrustNest. Please review.`
  return { subject, html, text }
}

export function generateInventoryAgreementAcceptedEmail(params: any): { subject: string; html: string; text: string } {
  const subject = `✓ Inventory Agreement Accepted – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #10b981; margin-top: 0;">✓ Agreement Activated</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello ${params.ownerName},<br>
      Thank you for accepting the inventory agreement!
    </p>
    <div class="highlight-box" style="background: #ecfdf5; border-left: 4px solid #10b981;">
      <p style="margin: 0; font-weight: bold; color: #065f46;">Status: ACTIVE</p>
      <p style="margin: 8px 0 0 0;">
        <strong>Property:</strong> ${params.propertyName}<br>
        <strong>Available Beds:</strong> ${params.bedCount}
      </p>
    </div>
    <p style="font-size: 13px; color: #475569; margin-top: 16px;">
      Your beds are now live on TrustNest! You'll start earning commissions as bookings are made. 
      Track your earnings and manage your property from your dashboard.
    </p>
    <div style="text-align: center; margin-top: 20px;">
      <a href="${params.dashboardUrl}" class="btn">View Dashboard &rarr;</a>
    </div>
    `
  )
  const text = `Your inventory agreement is now active! Your ${params.bedCount} beds are available for booking on TrustNest.`
  return { subject, html, text }
}

export function generateBookingCancellationEmail(params: any): { subject: string; html: string; text: string } {
  const isOwner = params.recipientRole === 'OWNER'
  const isSuperAdmin = params.recipientRole === 'SUPER_ADMIN'
  const subject = isOwner
    ? `[Booking Cancelled] Room ${params.roomNumber} (Bed ${params.bedIdentifier}) – ${params.propertyName}`
    : isSuperAdmin
      ? `[Super Admin] Booking ${params.bookingId} Cancelled – ${params.propertyName}`
      : `Your booking at ${params.propertyName} has been cancelled`

  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #b91c1c; margin-top: 0;">Booking Cancelled ❌</h2>
    <p style="font-size: 13px; color: #475569;">
      Hello <strong>${params.userName}</strong>,<br>
      The booking for <strong>Room ${params.roomNumber} (Bed ${params.bedIdentifier})</strong> at <strong>${params.propertyName}</strong> has been cancelled.
    </p>
    <div class="highlight-box" style="border-left: 4px solid #ef4444;">
      <p style="margin: 0;"><strong>Booking ID:</strong> ${params.bookingId}</p>
      <p style="margin: 4px 0 0 0;"><strong>Bed Status:</strong> Returned to inventory (VACANT)</p>
      ${params.refundAmount ? `<p style="margin: 4px 0 0 0;"><strong>Refund Status:</strong> ₹${params.refundAmount} (Simulated Demo Refund processed)</p>` : ''}
      ${params.reason ? `<p style="margin: 4px 0 0 0;"><strong>Reason:</strong> ${params.reason}</p>` : ''}
    </div>
    <p style="font-size: 12px; color: #64748b; margin-top: 16px;">
      If you have questions, please reach out to TrustNest Support.
    </p>
    `
  )
  const text = `Booking ${params.bookingId} for Room ${params.roomNumber} (Bed ${params.bedIdentifier}) at ${params.propertyName} has been cancelled.`
  return { subject, html, text }
}
