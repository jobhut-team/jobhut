'use client'

import { useState, useEffect } from 'react'
import JobCard from './JobCard'
import Loading from './Loading'

export default function RecentJobs() {
  const [jobs, setJobs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchJobs = async (retries = 3) => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/recent-jobs')
      if (!response.ok) {
        if (response.status >= 500 && retries > 0) {
          console.warn(`Retrying fetch due to server error: ${response.status}`)
          setTimeout(() => fetchJobs(retries - 1), 1000)
          return
        }
        throw new Error(`Failed to fetch recent jobs: ${response.status} ${response.statusText}`)
      }
      const data = await response.json()
      setJobs(data)
      setError(null)
    } catch (error) {
      console.error('Error fetching recent jobs:', error.message)
      setError('Failed to load recent jobs. Please try again later.')
      setJobs([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <div className="text-center text-red-500">{error}</div>
  }

  if (!jobs.length) {
    return (
      <div className="text-center text-gray-500">
        No jobs available at the moment.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {jobs.map(job => (
        <JobCard key={job._id} job={job} />
      ))}
    </div>
  )
}

