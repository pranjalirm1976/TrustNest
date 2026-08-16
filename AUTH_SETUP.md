# TrustNest Authentication System

This document covers the secure authentication implementation using NextAuth.js for TrustNest.

## 🔐 Authentication Overview

The system uses NextAuth.js with a custom Credentials provider that authenticates against the PostgreSQL database using Prisma and bcryptjs.

## 📁 File Structure

```
src/
├── lib/
│   ├── auth.ts              # NextAuth configuration
│   └── auth-utils.ts        # Server-side auth utilities
├── app/
│   ├── api/auth/[...nextauth]/
│   │   └── route.ts         # NextAuth API routes
│   ├── admin/
│   │   ├── login/
│   │   │   ├── page.tsx     # Login page (Server Component)
│   │   │   └── LoginForm.tsx # Login form (Client Component)
│   │   └── dashboard/
│   │       └── page.tsx     # Protected dashboard
│   └── unauthorized/
│       └── page.tsx         # Access denied page
├── components/
│   └── SessionProvider.tsx  # Client-side session provider
└── middleware.ts            # Route protection middleware
```

## 🚀 Setup Instructions

### 1. Environment Variables

Create a `.env.local` file:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/trustnest_db"

# NextAuth.js
NEXTAUTH_SECRET="your-super-secure-secret-key"
NEXTAUTH_URL="http://localhost:3000"

NODE_ENV="development"
```

### 2. Seed Database

Ensure your database is seeded with admin users:

```bash
npm run db:seed
```

### 3. Test Login Credentials

| Role | Email | Password |
|------|--------|----------|
| Inspector (Admin) | admin@trustnest.com | admin123 |
| Owner | rajesh@emeraldelite.com | owner123 |

## 🛡️ Security Features

### Route Protection

- **Middleware**: Protects all `/admin/*` routes
- **Role-based Access**: Only `OWNER` and `INSPECTOR` roles can access admin portal
- **Session Management**: JWT-based sessions with 30-day expiry

### Password Security

- Passwords hashed with bcryptjs (12 salt rounds)
- Passwords never returned in session objects
- Secure credential validation in server-side `authorize` callback

### Session Security

- CSRF protection built-in
- Secure HTTP-only cookies
- Session tokens include user ID and role for authorization

## 📋 Usage Examples

### Server Components (Recommended)

```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/admin/login')
  }

  return <div>Welcome, {session.user.name}!</div>
}
```

### Using Auth Utils

```tsx
import { requireAdmin, requireOwner } from '@/lib/auth-utils'

// Require admin access (OWNER or INSPECTOR)
export default async function AdminPage() {
  const session = await requireAdmin()
  return <div>Admin content</div>
}

// Require owner access only
export default async function OwnerPage() {
  const session = await requireOwner()
  return <div>Owner content</div>
}
```

### Client Components

```tsx
'use client'
import { useSession, signIn, signOut } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session, status } = useSession()

  if (status === 'loading') return <div>Loading...</div>
  if (!session) return <div>Not authenticated</div>

  return (
    <div>
      <p>Welcome, {session.user.name}!</p>
      <p>Role: {session.user.role}</p>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

## 🎨 UI Components

### Login Form Features

- **Glass morphism design** with dark gradient background
- **Floating labels** and clean input styling
- **Password visibility toggle**
- **Loading states** with spinner animation
- **Error handling** with amber-colored error messages
- **Form validation** with real-time feedback
- **Responsive design** for all screen sizes

### Design System Integration

- Uses TrustNest brand colors (Emerald Green + Warm Amber)
- Glass morphism effects via `.glass-dark` utility class
- Inter font family for modern typography
- Consistent hover states and transitions

## 🔧 Middleware Configuration

The middleware protects routes with these rules:

1. **Admin routes** (`/admin/*`): Require authentication
2. **Login page** (`/admin/login`): Redirect if already authenticated
3. **Role validation**: Only `OWNER` and `INSPECTOR` roles allowed
4. **Callback URLs**: Preserves intended destination after login

## 📊 Session Structure

```typescript
interface Session {
  user: {
    id: string      // User ID from database
    email: string   // User email
    name: string    // User display name
    role: Role      // TENANT | OWNER | INSPECTOR
  }
}
```

## 🚦 Testing the System

### 1. Test Route Protection

```bash
# Should redirect to login
curl http://localhost:3000/admin/dashboard

# Should show login page
curl http://localhost:3000/admin/login
```

### 2. Test Authentication

1. Navigate to `/admin/dashboard` - should redirect to login
2. Enter wrong credentials - should show error message
3. Enter correct admin credentials - should redirect to dashboard
4. Access dashboard directly - should work if authenticated

### 3. Test Role-based Access

- Try logging in with `TENANT` role - should be denied access
- Only `OWNER` and `INSPECTOR` roles should access admin portal

## 🔮 Future Enhancements

- Multi-factor authentication (MFA)
- OAuth providers (Google, GitHub)
- Password reset functionality
- Session activity logging
- Role-based dashboard routing
- API rate limiting

## ⚡ Performance Notes

- Server Components used where possible for better performance
- Minimal client-side JavaScript in login flow
- JWT sessions for stateless authentication
- Prisma connection pooling for database efficiency

## 🐛 Troubleshooting

### Common Issues

1. **"NEXTAUTH_SECRET is missing"**
   - Add `NEXTAUTH_SECRET` to your `.env.local` file

2. **Database connection errors**
   - Verify `DATABASE_URL` in environment variables
   - Ensure PostgreSQL is running

3. **Redirect loops**
   - Check middleware configuration
   - Verify `NEXTAUTH_URL` matches your domain

4. **Session not persisting**
   - Clear browser cookies and localStorage
   - Check if cookies are being set correctly

### Debug Mode

Set `NODE_ENV=development` to enable NextAuth debug logs in the console.

## 📝 Next Steps

1. ✅ Authentication system implemented
2. 🔄 Add password reset functionality
3. 🔄 Implement user management dashboard
4. 🔄 Add audit logging for security events
5. 🔄 Create role-specific dashboards

The authentication system is now production-ready and follows security best practices!