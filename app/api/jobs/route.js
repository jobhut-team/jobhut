import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'
import { verifyToken } from '../../lib/auth'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20
    const search = searchParams.get('search') || ''
    const skip = (page - 1) * limit

    const client = await clientPromise
    const db = client.db('jobhut')
    
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { companyName: { $regex: search, $options: 'i' } }
          ]
        }
      : {}

    const totalJobs = await db.collection('jobs').countDocuments(query)
    const jobs = await db.collection('jobs')
      .find(query)
      .sort({ datePosted: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()
    
    const serializedJobs = jobs.map(job => ({
      ...job,
      _id: job._id.toString(),
      datePosted: job.datePosted ? new Date(job.datePosted).toISOString() : null,
      lastDate: job.lastDate ? new Date(job.lastDate).toISOString() : null,
      expirationDate: job.expirationDate ? new Date(job.expirationDate).toISOString() : null
    }))
    
    return NextResponse.json({
      jobs: serializedJobs,
      total: totalJobs,
      page,
      totalPages: Math.ceil(totalJobs / limit)
    })
  } catch (error) {
    console.error('Error in GET /api/jobs:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1]
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decodedToken = verifyToken(token)
    if (!decodedToken) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const jobData = await request.json()
    const client = await clientPromise
    const db = client.db('jobhut')
    
    // Ensure datePosted is set to the current date and time
    jobData.datePosted = new Date()
    
    const result = await db.collection('jobs').insertOne(jobData)
    
    return NextResponse.json({ success: true, _id: result.insertedId.toString() })
  } catch (error) {
    console.error('Error in POST /api/jobs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

