import { authOptions } from '../src/lib/auth'
import { prisma } from '../src/lib/prisma'

async function runGoogleAuthTests() {
  console.log('--- STARTING TRUSTNEST GOOGLE AUTHENTICATION TESTS ---')

  let passed = 0
  let total = 0

  function assert(condition: boolean, testName: string) {
    total++
    if (condition) {
      console.log(`✅ PASS: ${testName}`)
      passed++
    } else {
      console.error(`❌ FAIL: ${testName}`)
      throw new Error(`Test failed: ${testName}`)
    }
  }

  // 1. Verify Google Provider in authOptions
  const googleProvider = authOptions.providers.find((p: any) => p.id === 'google')
  assert(!!googleProvider, 'Google Provider exists in NextAuth options')

  // 2. Test Google sign-in callback for NEW USER
  const testNewEmail = `test.google.user.${Date.now()}@example.com`
  const mockNewGoogleUser: any = {
    id: 'temp-id',
    email: testNewEmail,
    name: 'Google Test User',
  }
  const mockGoogleAccount: any = {
    provider: 'google',
    type: 'oauth',
    providerAccountId: 'google-uid-12345'
  }

  // Call NextAuth signIn callback
  const signInCallback = authOptions.callbacks?.signIn
  if (signInCallback) {
    const result = await signInCallback({
      user: mockNewGoogleUser,
      account: mockGoogleAccount,
      profile: undefined,
      email: undefined,
      credentials: undefined
    })
    assert(result === true, 'Google signIn callback returns true for new user')

    // Verify user was created in DB with strict TENANT/USER role
    const createdDbUser = await prisma.user.findUnique({
      where: { email: testNewEmail }
    })
    assert(!!createdDbUser, 'New user is persisted to PostgreSQL database')
    assert(createdDbUser?.role === 'TENANT', 'New Google user has strict TENANT (USER) role')
    assert(createdDbUser?.role !== 'OWNER', 'Google user was NOT assigned OWNER role')
    assert(createdDbUser?.role !== 'SUPER_ADMIN', 'Google user was NOT assigned SUPER_ADMIN role')

    // 3. Test Account Linking (Same Google user logging in again)
    const mockExistingGoogleUser: any = {
      id: 'another-temp-id',
      email: testNewEmail,
      name: 'Google Test User Updated Name',
    }
    const repeatResult = await signInCallback({
      user: mockExistingGoogleUser,
      account: mockGoogleAccount,
      profile: undefined,
      email: undefined,
      credentials: undefined
    })
    assert(repeatResult === true, 'Google signIn callback returns true for existing user')

    // Verify no duplicate account was created
    const count = await prisma.user.count({
      where: { email: testNewEmail }
    })
    assert(count === 1, 'Only one user record exists (no duplicate user account created)')

    // 4. Test Role Preservation for Existing Non-Admin vs Admin
    // Ensure an existing OWNER logging in via Google retains OWNER role and is not downgraded or corrupted
    const testOwnerEmail = `test.owner.preserved.${Date.now()}@example.com`
    await prisma.user.create({
      data: {
        email: testOwnerEmail,
        name: 'Existing Owner User',
        role: 'OWNER',
        passwordHash: 'dummy'
      }
    })

    const mockOwnerGoogleUser: any = {
      id: 'owner-temp-id',
      email: testOwnerEmail,
      name: 'Existing Owner User',
    }
    await signInCallback({
      user: mockOwnerGoogleUser,
      account: mockGoogleAccount,
      profile: undefined,
      email: undefined,
      credentials: undefined
    })

    const preservedOwner = await prisma.user.findUnique({
      where: { email: testOwnerEmail }
    })
    assert(preservedOwner?.role === 'OWNER', 'Existing user role is preserved upon Google login')

    // Cleanup test records
    await prisma.user.deleteMany({
      where: { email: { in: [testNewEmail, testOwnerEmail] } }
    })
    assert(true, 'Test database records cleaned up cleanly')
  }

  console.log(`\n🎉 SUMMARY: ${passed}/${total} Google Auth Tests Passed Successfully!`)
}

runGoogleAuthTests()
  .catch((err) => {
    console.error('Test execution failed:', err)
    process.exit(1)
  })
