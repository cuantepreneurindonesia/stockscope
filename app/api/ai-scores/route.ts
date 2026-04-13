/**
 * AI Score Snapshots API
 * 
 * @swagger
 * /ai-scores:
 *   get:
 *     summary: Retrieve AI scores
 *     description: Get AI scores with flexible filtering (ticker, date, modelVersion).
 *     tags:
 *       - Indicators
 *     parameters:
 *       - in: query
 *         name: ticker
 *         schema:
 *           type: string
 *       - in: query
 *         name: date
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Success
 *   post:
 *     summary: Add an AI score snapshot
 *     description: Uses an upsert pattern to handle duplicate ticker+date+model combinations.
 *     tags:
 *       - Indicators
 *     responses:
 *       201:
 *         description: Successfully created/upserted
 *   delete:
 *     summary: Delete AI scores
 *     description: Delete AI scores for a specific ticker and date.
 *     tags:
 *       - Indicators
 *     responses:
 *       200:
 *         description: Successfully deleted
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { withFeatureGateHandler } from '@/lib/feature-gate-middleware'

/**
 * GET /api/ai-scores
 * Get AI scores with flexible filtering
 * 
 * Query params:
 *   - ticker: Stock ticker (e.g., ?ticker=BBCA)
 *   - date: Specific date (e.g., ?date=2024-03-29)
 *   - modelVersion: Filter by model (e.g., ?modelVersion=claude-sonnet-4.5-v1)
 *   - minScore: Min composite score (e.g., ?minScore=70)
 *   - startDate: Date range start (e.g., ?startDate=2024-01-01)
 *   - endDate: Date range end (e.g., ?endDate=2024-03-29)
 *   - limit: Max records (default: 100, max: 1000)
 * 
 * FEATURE GATE: Requires Premium plan for AI insights
 */
export const GET = withFeatureGateHandler('ai:insights', async (request: NextRequest) => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')
    const dateParam = searchParams.get('date')
    const modelVersion = searchParams.get('modelVersion')
    const minScore = searchParams.get('minScore')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limitParam = searchParams.get('limit')

    // Build filter
    const where: any = {}

    if (ticker) {
      where.ticker = ticker.toUpperCase()
    }

    if (dateParam) {
      where.date = new Date(dateParam)
    } else if (startDate || endDate) {
      where.date = {}
      if (startDate) where.date.gte = new Date(startDate)
      if (endDate) where.date.lte = new Date(endDate)
    }

    if (modelVersion) {
      where.modelVersion = modelVersion
    }

    if (minScore) {
      where.compositeScore = { gte: parseFloat(minScore) }
    }

    // Parse limit
    const limit = Math.min(
      parseInt(limitParam || '100', 10),
      1000
    )

    const scores = await prisma.aIScoreSnapshot.findMany({
      where,
      orderBy: [
        { date: 'desc' },
        { compositeScore: 'desc' }
      ],
      take: limit,
      select: {
        id: true,
        ticker: true,
        date: true,
        modelVersion: true,
        fundamentalScore: true,
        technicalScore: true,
        sentimentScore: true,
        liquidityScore: true,
        governanceScore: true,
        compositeScore: true,
        confidence: true,
        reasoning: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      count: scores.length,
      data: scores
    })

  } catch (error) {
    console.error('GET /api/ai-scores error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
});

/**
 * POST /api/ai-scores
 * Add AI score snapshot
 * Uses upsert pattern to handle duplicate ticker+date+model combinations
 * 
 * Body:
 * {
 *   ticker: "BBCA",
 *   date: "2024-03-29",
 *   modelVersion: "claude-sonnet-4.5-v1",
 *   fundamentalScore: 85.5,
 *   technicalScore: 72.3,
 *   sentimentScore: 68.9,
 *   liquidityScore: 91.2,
 *   governanceScore: 78.5,
 *   compositeScore: 79.3,
 *   confidence: 0.92,
 *   reasoning: "Strong fundamentals with positive momentum"
 * }
 * 
 * Or batch upload:
 * {
 *   scores: [
 *     { ticker: "BBCA", date: "2024-03-29", modelVersion: "...", ... },
 *     { ticker: "BBRI", date: "2024-03-29", modelVersion: "...", ... }
 *   ]
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Handle batch upload
    if (body.scores && Array.isArray(body.scores)) {
      const results = []

      for (const score of body.scores) {
        const {
          ticker,
          date,
          modelVersion,
          fundamentalScore,
          technicalScore,
          sentimentScore,
          liquidityScore,
          governanceScore,
          compositeScore,
          confidence,
          reasoning
        } = score

        // Validation
        if (!ticker || !date || !modelVersion || compositeScore === undefined) {
          return NextResponse.json(
            { error: 'Missing required fields in score: ticker, date, modelVersion, compositeScore' },
            { status: 400 }
          )
        }

        // Validate score ranges (0-100)
        const scores = [fundamentalScore, technicalScore, sentimentScore, liquidityScore, governanceScore, compositeScore]
        if (scores.some(s => s !== null && s !== undefined && (s < 0 || s > 100))) {
          return NextResponse.json(
            { error: 'Scores must be between 0 and 100' },
            { status: 400 }
          )
        }

        // Upsert score
        const result = await prisma.aIScoreSnapshot.upsert({
          where: {
            ticker_date_modelVersion: {
              ticker: ticker.toUpperCase(),
              date: new Date(date),
              modelVersion
            }
          },
          update: {
            fundamentalScore: fundamentalScore || null,
            technicalScore: technicalScore || null,
            sentimentScore: sentimentScore || null,
            liquidityScore: liquidityScore || null,
            governanceScore: governanceScore || null,
            compositeScore,
            confidence: confidence || null,
            reasoning: reasoning || null
          },
          create: {
            ticker: ticker.toUpperCase(),
            date: new Date(date),
            modelVersion,
            fundamentalScore: fundamentalScore || null,
            technicalScore: technicalScore || null,
            sentimentScore: sentimentScore || null,
            liquidityScore: liquidityScore || null,
            governanceScore: governanceScore || null,
            compositeScore,
            confidence: confidence || null,
            reasoning: reasoning || null
          }
        })

        results.push(result)
      }

      return NextResponse.json({
        success: true,
        message: `Processed ${results.length} AI score snapshots`,
        count: results.length
      }, { status: 201 })
    }

    // Handle single score
    const {
      ticker,
      date,
      modelVersion,
      fundamentalScore,
      technicalScore,
      sentimentScore,
      liquidityScore,
      governanceScore,
      compositeScore,
      confidence,
      reasoning
    } = body

    // Validation
    if (!ticker || !date || !modelVersion || compositeScore === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: ticker, date, modelVersion, compositeScore' },
        { status: 400 }
      )
    }

    // Validate score ranges (0-100)
    const scores = [fundamentalScore, technicalScore, sentimentScore, liquidityScore, governanceScore, compositeScore]
    if (scores.some(s => s !== null && s !== undefined && (s < 0 || s > 100))) {
      return NextResponse.json(
        { error: 'Scores must be between 0 and 100' },
        { status: 400 }
      )
    }

    // Upsert score
    const scoreSnapshot = await prisma.aIScoreSnapshot.upsert({
      where: {
        ticker_date_modelVersion: {
          ticker: ticker.toUpperCase(),
          date: new Date(date),
          modelVersion
        }
      },
      update: {
        fundamentalScore: fundamentalScore || null,
        technicalScore: technicalScore || null,
        sentimentScore: sentimentScore || null,
        liquidityScore: liquidityScore || null,
        governanceScore: governanceScore || null,
        compositeScore,
        confidence: confidence || null,
        reasoning: reasoning || null
      },
      create: {
        ticker: ticker.toUpperCase(),
        date: new Date(date),
        modelVersion,
        fundamentalScore: fundamentalScore || null,
        technicalScore: technicalScore || null,
        sentimentScore: sentimentScore || null,
        liquidityScore: liquidityScore || null,
        governanceScore: governanceScore || null,
        compositeScore,
        confidence: confidence || null,
        reasoning: reasoning || null
      }
    })

    return NextResponse.json({
      success: true,
      data: scoreSnapshot
    }, { status: 201 })

  } catch (error) {
    console.error('POST /api/ai-scores error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/ai-scores
 * Delete AI scores for a specific ticker, date, and model version
 * 
 * Query params:
 *   - ticker: Stock ticker (required)
 *   - date: Specific date (required)
 *   - modelVersion: Model version (optional - deletes all versions if omitted)
 * 
 * Use case: Remove bad scores from model bugs
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const ticker = searchParams.get('ticker')
    const dateParam = searchParams.get('date')
    const modelVersion = searchParams.get('modelVersion')

    if (!ticker || !dateParam) {
      return NextResponse.json(
        { error: 'Missing required parameters: ticker, date' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = {
      ticker: ticker.toUpperCase(),
      date: new Date(dateParam)
    }

    if (modelVersion) {
      where.modelVersion = modelVersion
    }

    // Delete matching scores
    const result = await prisma.aIScoreSnapshot.deleteMany({ where })

    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} AI score snapshots`,
      deletedCount: result.count
    })

  } catch (error) {
    console.error('DELETE /api/ai-scores error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
