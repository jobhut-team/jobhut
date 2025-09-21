import { NextResponse } from 'next/server'
import clientPromise from '../../lib/mongodb'

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db('jobhut')
    
    const jobs = await db.collection('jobs')
      .find()
      .sort({ datePosted: -1 })
      .limit(6)
      .toArray()

    const serializedJobs = jobs.map(job => ({
      ...job,
      _id: job._id.toString(),
      datePosted: job.datePosted ? new Date(job.datePosted).toISOString() : null,
      lastDate: job.lastDate ? new Date(job.lastDate).toISOString() : null,
      expirationDate: job.expirationDate ? new Date(job.expirationDate).toISOString() : null,
    }))

    return NextResponse.json(serializedJobs)
  } catch (error) {
    console.error('Error in recent-jobs API:', error.message)
    console.error('Stack:', error.stack)
    return NextResponse.json({ error: 'Failed to fetch recent jobs' }, { status: 500 })
  }
}

