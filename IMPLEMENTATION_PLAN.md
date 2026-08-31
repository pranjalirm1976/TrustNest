# TrustNest Mentor Feedback Implementation Plan

**Status**: Inception Phase  
**Date**: 2026-08-31  
**Target**: Complete mentor requirements without destroying existing functionality

---

## Phase 1: Analysis & Baseline (CURRENT)

✅ **Completed**:
- Analyzed existing codebase
- Reviewed Prisma schema
- Identified existing booking flow
- Verified payment split logic (10%/90%)
- Confirmed notification system
- Checked authentication architecture

**Key Findings**:
- Core infrastructure exists for most features
- TrustNest inventory model already partially implemented
- Booking, payment, and notification flow mostly functional
- Email service skeleton needs implementation
- Google OAuth not integrated
- Phone OTP verification system missing
- Identity verification system missing
- Audit log system missing
- Gender eligibility enforcement missing server-side

---

## Phase 2: Database Extensions (NOT STARTED)

### Required Schema Changes

#### 2.1 Phone Verification Model
```prisma
model PhoneVerification {
  id            String   @id @default(cuid())
  userId        String
  phone         String
  otp           String
  status        String   @default("PENDING") // PENDING, VERIFIED, EXPIRED
  createdAt     DateTime @default(now())
  expiresAt     DateTime
  attempts      Int      @default(0)
  
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, phone])
}
```

#### 2.2 Identity Verification Model
```prisma
model IdentityVerification {
  id                String   @id @default(cuid())
  userId            String   @unique
  documentType      String   // AADHAR, PAN, PASSPORT, DRIVING_LICENSE
  documentUrl       String   // Secure file storage
  status            String   @default("PENDING") // PENDING, VERIFIED, REJECTED
  verifiedAt        DateTime?
  verifiedBy        String?  // Admin ID
  rejectionReason   String?
  createdAt         DateTime @default(now())
  
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  admin             User?    @relation("VerifiedDocuments", fields: [verifiedBy], references: [id])
}
```

#### 2.3 Inventory Agreement Model
```prisma
model InventoryAgreement {
  id                  String   @id @default(cuid())
  propertyId          String
  ownerId             String
  trustNestBedCount   Int
  selectedBeds        String   // JSON array of bed IDs
  agreementStartDate  DateTime
  agreementEndDate    DateTime?
  status              String   @default("ACTIVE") // ACTIVE, EXPIRED, CANCELLED
  agreementText       String   // Configurable terms
  acceptedAt          DateTime
  acceptedBy          String
  agreementVersion    Int      @default(1)
  createdAt           DateTime @default(now())
  
  property            Property @relation(fields: [propertyId], references: [id], onDelete: Cascade)
  owner               User     @relation(fields: [ownerId], references: [id], onDelete: Cascade)
}
```

#### 2.4 Audit Log Model
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  actor       String   // User ID
  role        String   // User role at time of action
  action      String   // PG_REGISTERED, PHONE_VERIFIED, ID_VERIFIED, etc.
  entity      String   // Entity type: Property, User, Booking, etc.
  entityId    String   // Entity ID
  details     String   // JSON additional details
  timestamp   DateTime @default(now())
  ipAddress   String?
  
  @@index([entityId])
  @@index([actor])
  @@index([timestamp])
}
```

#### 2.5 Extend Existing Models
- **User**: Add `phone`, `phoneVerified`, `genderEligibility`, `dateOfBirth`
- **Bed**: Already has `isTrustNestInventory`, update status values
- **Booking**: Add `genderEligibility`, `identityVerified`, `phoneVerified`

---

## Phase 3: Google OAuth Integration (PRIORITY 1)

### 3.1 Files to Modify
- `src/lib/auth.ts`: Add GoogleProvider
- `.env.example`: Add GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
- `src/app/admin/login/LoginForm.tsx`: Add Google sign-in button
- `src/app/tenant/login/TenantLoginForm.tsx`: Add Google sign-in button

### 3.2 Implementation Details
- Use `next-auth/providers/google`
- Support both email/password AND Google OAuth
- Auto-create user on first Google login
- Don't override existing user data

---

## Phase 4: Phone Verification System (PRIORITY 2)

### 4.1 DEMO OTP Mode
```
Environment: OTP_MODE=DEMO
Display: "Demo OTP: 123456"
```

### 4.2 Files to Create
- `src/services/otp/otp.service.ts`: OTP generation, verification, DEMO mode
- `src/actions/phone.actions.ts`: Server actions for phone verification
- `src/app/auth/phone-verify/page.tsx`: Phone verification UI

### 4.3 API Endpoints
- POST `/api/otp/send`: Send OTP to phone
- POST `/api/otp/verify`: Verify OTP

---

## Phase 5: Identity Verification System (PRIORITY 3)

### 5.1 Files to Create
- `src/app/auth/identity-verify/page.tsx`: Identity verification form
- `src/actions/identity.actions.ts`: Upload and verify identity
- `src/app/super-admin/verification/page.tsx`: Admin review panel

### 5.2 Features
- File upload (secure storage)
- Document type selection
- Admin review panel
- Status tracking (PENDING, VERIFIED, REJECTED)

---

## Phase 6: Gender Eligibility Enforcement (PRIORITY 4)

### 6.1 Server-Side Validation
- Check user gender during booking
- Check floor/room/PG eligibility
- Enforce at booking.actions.ts `bookBed()` function

### 6.2 Changes to Models
- Add `userGender` to User model
- Add `eligibilityRule` to Property, Floor, Room models
- Update Booking validation logic

---

## Phase 7: Inventory Agreement System (PRIORITY 5)

### 7.1 Owner Workflow
- During PG registration: Select beds allocated to TrustNest
- Show inventory agreement form
- Owner accepts agreement
- Create InventoryAgreement record

### 7.2 Files to Modify
- `src/app/admin/registration/page.tsx`: Add inventory selection step
- `src/app/admin/properties/page.tsx`: Display agreement status

---

## Phase 8: Audit Log System (PRIORITY 6)

### 8.1 Implementation
- Create `src/lib/audit.ts`: Audit logging utility
- Log all critical events:
  - PG registered
  - PG approved/rejected
  - Phone verified
  - ID verified
  - Booking created
  - Payment processed
  - etc.

### 8.2 Super Admin View
- `src/app/super-admin/audit-logs/page.tsx`: View all audit logs

---

## Phase 9: Email System Implementation (PRIORITY 7)

### 9.1 Files to Create
- `src/services/email/templates/` folder with email templates
- `src/services/email/sender.ts`: Email sending logic

### 9.2 Email Types
- Booking confirmation (to user)
- New booking notification (to owner)
- New booking notification (to super admin)
- All must handle failure gracefully (Requirement 23)

---

## Phase 10: Authorization & Access Control (PRIORITY 8)

### 10.1 Server-Side Checks
- Verify user can only access own data
- Owner can only manage own properties
- Super Admin can manage all
- Public endpoints don't require auth

### 10.2 Files to Modify
- `src/middleware.ts`: Already has some checks, enhance
- All API routes: Add authorization checks
- All server actions: Add authorization checks

---

## Phase 11: Public Website Verification (PRIORITY 9)

### 11.1 Verify No Login Required For
- Homepage
- Search PGs
- Filter PGs
- View map
- View PG cards
- View PG details
- View photos
- View amenities
- View food menu
- View reviews
- View floor layouts
- View rooms
- View beds
- View 3D (if available)

### 11.2 Test Scenarios
- Anonymous user can browse entire catalog
- Anonymous user can click "Book Now"
- Clicking "Book Now" shows login/register
- After login, return to booking flow
- All selections preserved during login

---

## Phase 12: Complete Booking Flow (PRIORITY 10)

### 12.1 Flow Sequence
1. Anonymous Browse → Book Now
2. Login/Register (or Google OAuth)
3. Phone Verification (OTP)
4. Identity Verification (file upload)
5. Gender/Eligibility Check
6. Booking Summary
7. Demo Payment (success/failure simulation)
8. Booking Confirmation
9. Resident Created
10. Notifications sent

### 12.2 Files to Enhance
- `src/components/property/BookingModal.tsx`: Already has most of this
- Add phone verification step
- Add identity verification step
- Add eligibility check

---

## Phase 13: Resident Creation & Dashboard (PRIORITY 11)

### 13.1 Resident Model/Role
- After confirmed booking, create Resident association
- Resident can access: My PG, Room, Bed, Payments, Complaints, Food, Reviews
- Distinguish from User role

### 13.2 Dashboard
- Already exists at `/tenant/dashboard`
- Verify it shows resident-specific data

---

## Phase 14: Testing & Validation (PRIORITY 12)

### 14.1 Scenarios to Test
- SCENARIO A: Public browsing without login ✓
- SCENARIO B: Valid booking flow ✓
- SCENARIO C: Ineligible user blocked ✓
- SCENARIO D: Owner-managed bed unavailable ✓
- SCENARIO E: Double booking prevented ✓
- SCENARIO F: Payment failure handled ✓
- SCENARIO G: ID not verified blocks booking ✓
- SCENARIO H: Owner registration with super admin approval ✓
- SCENARIO I: Owner A cannot access Owner B's data ✓

### 14.2 Production Checks
- Prisma validation
- TypeScript check
- Lint
- Production build
- API tests
- Auth tests

---

## Implementation Order

### Sprint 1: Foundation
1. Extend database schema (Models in Phase 2)
2. Run Prisma migration

### Sprint 2: Authentication
3. Add Google OAuth (Phase 3)
4. Add phone verification (Phase 4)
5. Add identity verification (Phase 5)

### Sprint 3: Validation & Business Logic
6. Implement gender eligibility (Phase 6)
7. Implement inventory agreement (Phase 7)
8. Implement audit logging (Phase 8)

### Sprint 4: Notifications & External Systems
9. Implement email system (Phase 9)
10. Enhance authorization (Phase 10)

### Sprint 5: Testing & Refinement
11. Verify public website (Phase 11)
12. Complete booking flow testing (Phase 12)
13. Resident creation validation (Phase 13)
14. Full end-to-end testing (Phase 14)

---

## Notes

- **PAYMENT_MODE=DEMO**: Keep demo payment mode, no real transactions
- **OTP_MODE=DEMO**: Show demo OTP (e.g., "123456")
- **Email Errors**: Must NOT break confirmed bookings (safe dispatch)
- **Public Access**: No login wall for browse/search/details
- **Database**: Do NOT use `prisma db reset` on live data
- **Existing Features**: Keep search, map, PG details, food, reviews, complaints, owner dashboard, admin dashboard, 3D viewer
- **Authorization**: Server-side only, never trust frontend role

---

## Success Criteria Checklist

- [ ] Visitor browses TrustNest without login
- [ ] Visitor clicks Book Now → login appears
- [ ] Google login works
- [ ] Phone OTP works (DEMO mode)
- [ ] Identity verification workflow exists
- [ ] Gender/eligibility enforced server-side
- [ ] Owner can allocate beds to TrustNest
- [ ] Owner-managed beds cannot be booked through TrustNest
- [ ] User can book a TrustNest bed
- [ ] Demo payment works
- [ ] Booking confirmed only after successful payment
- [ ] Resident created after booking
- [ ] User notification created
- [ ] Owner notification created
- [ ] Super Admin notification created
- [ ] User booking email sent
- [ ] Owner booking email sent
- [ ] Super Admin booking email sent
- [ ] All records stored properly
- [ ] PG approved by Super Admin appears on public site
- [ ] Unauthorized access blocked
- [ ] Existing features working

---

## Files to Create/Modify Summary

### New Files
- Prisma models (schema.prisma additions)
- `src/services/otp/otp.service.ts`
- `src/actions/phone.actions.ts`
- `src/actions/identity.actions.ts`
- `src/app/auth/phone-verify/page.tsx`
- `src/app/auth/identity-verify/page.tsx`
- `src/app/super-admin/verification/page.tsx`
- `src/app/super-admin/audit-logs/page.tsx`
- `src/services/email/sender.ts`
- `src/services/email/templates/*`
- `src/lib/audit.ts`

### Modified Files
- `src/lib/auth.ts` (add Google provider)
- `src/actions/booking.actions.ts` (add phone/ID/gender checks)
- `src/components/property/BookingModal.tsx` (add verification steps)
- `src/middleware.ts` (enhance authorization)
- `.env.example`
- `prisma/schema.prisma`

### No Changes Needed
- Search, map, PG details pages (already public)
- Existing booking modal (will be enhanced)
- Payment system (already working demo mode)
- Chat system (keep as is)
- Food menu system (keep as is)
- Complaint system (keep as is)
- Review system (keep as is)

---

Generated: 2026-08-31
