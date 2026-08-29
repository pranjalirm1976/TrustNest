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
  const subject = `TrustNest Booking Confirmation – ${params.propertyName}`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">Booking Confirmed! 🎉</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.userName}</strong>,<br>
      Your bed reservation at <strong>${params.propertyName}</strong> has been successfully confirmed.
    </p>

    <div class="highlight-box">
      <div style="margin-bottom: 12px;"><span class="tag tag-demo">Sandbox Demo Payment</span> <span class="tag tag-success">Confirmed</span></div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b;">PG Property:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Address:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.propertyAddress}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Allocated Room &amp; Bed:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Room ${params.roomNumber} (Bed ${params.bedIdentifier})</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Move-In Date:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.moveInDate}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${params.bookingId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Transaction ID:</td><td style="text-align: right; font-family: monospace; font-weight: bold;">${params.transactionId}</td></tr>
        <tr><td style="padding: 8px 0 0 0; color: #0f172a; font-weight: bold;">Amount Paid:</td><td style="padding: 8px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #0f172a;">₹${params.amount.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    <p style="font-size: 12px; color: #64748b; line-height: 1.5;">
      You can view your verified floor layout, daily food audits, and communicate with the owner directly inside your TrustNest dashboard.
    </p>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/tenant/dashboard" class="btn">View Resident Dashboard &rarr;</a>
    </div>
    `
  )

  const text = `
TRUSTNEST BOOKING CONFIRMATION
Hello ${params.userName},

Your stay at ${params.propertyName} is confirmed.
- Room: ${params.roomNumber} (Bed ${params.bedIdentifier})
- Move-In: ${params.moveInDate}
- Booking ID: ${params.bookingId}
- Txn ID: ${params.transactionId}
- Amount: ₹${params.amount} (DEMO)

View Dashboard: http://localhost:3000/tenant/dashboard
`
  return { subject, html, text }
}

export function generateOwnerNewBookingEmail(params: OwnerNewBookingParams): { subject: string; html: string; text: string } {
  const subject = `New TrustNest Booking – Room ${params.roomNumber} (Bed ${params.bedIdentifier})`
  const html = baseEmailWrapper(
    subject,
    `
    <h2 style="font-size: 18px; color: #0f172a; margin-top: 0;">New Resident Booking Received 🔔</h2>
    <p style="font-size: 13px; color: #475569; line-height: 1.6;">
      Hello <strong>${params.ownerName}</strong>,<br>
      A new resident has successfully reserved a bed at <strong>${params.propertyName}</strong> through TrustNest.
    </p>

    <div class="highlight-box">
      <div style="margin-bottom: 12px;"><span class="tag tag-success">New Stay Booked</span></div>
      <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
        <tr><td style="padding: 4px 0; color: #64748b;">Resident Name:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentName}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Resident Email:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentEmail}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Contact:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.residentPhone || 'Via In-App Chat'}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Room &amp; Bed:</td><td style="text-align: right; font-weight: bold; color: #4f46e5;">Room ${params.roomNumber} - Bed ${params.bedIdentifier}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Move-In Date:</td><td style="text-align: right; font-weight: bold; color: #0f172a;">${params.moveInDate}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking ID:</td><td style="text-align: right; font-family: monospace;">${params.bookingId}</td></tr>
        <tr><td style="padding: 4px 0; color: #64748b;">Booking Total:</td><td style="text-align: right; font-weight: bold;">₹${params.amount.toLocaleString('en-IN')}</td></tr>
        <tr><td style="padding: 8px 0 0 0; color: #15803d; font-weight: bold;">Owner Net Payout (90%):</td><td style="padding: 8px 0 0 0; text-align: right; font-weight: 800; font-size: 16px; color: #15803d;">₹${params.ownerPayout.toLocaleString('en-IN')}</td></tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 24px;">
      <a href="http://localhost:3000/admin/payments" class="btn">View Booking &amp; Revenue &rarr;</a>
    </div>
    `
  )

  const text = `
TRUSTNEST NEW BOOKING ALERT
Hello ${params.ownerName},

A new resident (${params.residentName} - ${params.residentEmail}) has booked Room ${params.roomNumber} (Bed ${params.bedIdentifier}) at ${params.propertyName}.
- Net Owner Payout: ₹${params.ownerPayout}
- Booking ID: ${params.bookingId}
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
