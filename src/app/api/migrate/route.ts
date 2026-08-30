import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Create Core Tables via PostgreSQL DDL if not already created
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'TENANT',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "properties" (
        "id" TEXT PRIMARY KEY,
        "ownerId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "address" TEXT NOT NULL,
        "latitude" DOUBLE PRECISION NOT NULL DEFAULT 18.5913,
        "longitude" DOUBLE PRECISION NOT NULL DEFAULT 73.7389,
        "priceFrom" DOUBLE PRECISION NOT NULL DEFAULT 8500,
        "gender" TEXT NOT NULL DEFAULT 'UNISEX',
        "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
        "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "properties_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "property_images" (
        "id" TEXT PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "url" TEXT NOT NULL,
        "altText" TEXT,
        "category" TEXT DEFAULT 'general',
        "isCover" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "property_images_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "floors" (
        "id" TEXT PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "level" INTEGER NOT NULL,
        "name" TEXT NOT NULL,
        "layoutUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "floors_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" TEXT PRIMARY KEY,
        "floorId" TEXT NOT NULL,
        "roomNumber" TEXT NOT NULL,
        "capacity" INTEGER NOT NULL DEFAULT 2,
        "sharingType" TEXT NOT NULL DEFAULT 'DOUBLE',
        "price" DOUBLE PRECISION NOT NULL DEFAULT 8500,
        "hasWashroom" BOOLEAN NOT NULL DEFAULT true,
        "hasAc" BOOLEAN NOT NULL DEFAULT false,
        "hasBalcony" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "rooms_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "beds" (
        "id" TEXT PRIMARY KEY,
        "roomId" TEXT NOT NULL,
        "identifier" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'VACANT',
        "isTrustNestInventory" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "beds_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "amenities" (
        "id" TEXT PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "isAvailable" BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "amenities_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "owner_subscriptions" (
        "id" TEXT PRIMARY KEY,
        "ownerId" TEXT NOT NULL,
        "propertyId" TEXT,
        "planName" TEXT NOT NULL DEFAULT 'TRUSTNEST_GROWTH',
        "amount" DOUBLE PRECISION NOT NULL DEFAULT 2000,
        "status" TEXT NOT NULL DEFAULT 'ACTIVE',
        "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
        "cfSubscriptionId" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "owner_subscriptions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "subscription_invoices" (
        "id" TEXT PRIMARY KEY,
        "subscriptionId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "cfOrderId" TEXT,
        "cfPaymentId" TEXT,
        "status" TEXT NOT NULL DEFAULT 'PAID',
        "paidAt" TIMESTAMP(3),
        "receiptUrl" TEXT,
        "billingMonth" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "subscription_invoices_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "owner_subscriptions"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "complaints" (
        "id" TEXT PRIMARY KEY,
        "propertyId" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "category" TEXT NOT NULL DEFAULT 'PLUMBING',
        "status" TEXT NOT NULL DEFAULT 'OPEN',
        "severity" TEXT NOT NULL DEFAULT 'MEDIUM',
        "slaDeadline" TIMESTAMP(3) NOT NULL,
        "resolvedAt" TIMESTAMP(3),
        "isEscalated" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "complaints_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "complaints_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );

      CREATE TABLE IF NOT EXISTS "notifications" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "message" TEXT NOT NULL,
        "type" TEXT NOT NULL DEFAULT 'SYSTEM',
        "isRead" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `)

    return NextResponse.json({
      success: true,
      message: 'All PostgreSQL tables created successfully in Supabase!'
    })
  } catch (error: any) {
    console.error('Migrate API error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
