/**
 * POST /api/payment/cancel
 * Handle subscription cancellation requests
 * 
 * Sprint 4, Task SP4-03: Server-Side Payment Events
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = session.user.id
    const body = await request.json()
    const { reason, feedback } = body

    // TODO: Call Midtrans API to cancel subscription
    // For now, just track the event

    // Track subscription cancellation event
    await prisma.analyticsEvent.create({
      data: {
        eventName: 'subscription_cancelled',
        timestamp: new Date(),
        sessionId: 'server-subscription-cancel',
        userId: userId,
        platform: 'web',
        deviceType: 'desktop',
        locale: 'id',
        properties: {
          cancellationReason: reason,
          userFeedback: feedback,
          timestamp: Date.now()
        },
        processedAt: new Date()
      }
    })

    console.log(`User ${userId} cancelled subscription. Reason: ${reason}`)

    return NextResponse.json({
      success: true,
      message: 'Subscription cancelled'
    })

  } catch (error) {
    console.error('POST /api/payment/cancel error:', error)
    
    // Track API error
    try {
      await prisma.analyticsEvent.create({
        data: {
          eventName: 'api_error',
          timestamp: new Date(),
          sessionId: 'server-error',
          platform: 'web',
          deviceType: 'desktop',
          locale: 'en',
          properties: {
            endpoint: '/api/payment/cancel',
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          },
          processedAt: new Date()
        }
      })
    } catch (trackingError) {
      console.error('Failed to track error:', trackingError)
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
