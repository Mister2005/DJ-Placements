import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Button, Modal } from '../components/Common'
import { SkillMatcher } from '../components/FeatureComponents'
import { jobService, applicationService, resumeService } from '../services/api'

export default function JobDetailsPage() {
  const { jobId } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [showApplyModal, setShowApplyModal] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [skillMatch, setSkillMatch] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const [jobRes, matchRes] = await Promise.all([
          jobService.getJobById(jobId),
          resumeService.skillMatching(jobId)
        ])
        setJob(jobRes.data.job)
        setHasApplied(jobRes.data.has_applied)
        setSkillMatch(matchRes.data)
      } catch (err) {
        console.error('Failed to fetch job details:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchJob()
  }, [jobId])

  const handleApply = async () => {
    try {
      await applicationService.applyForJob(jobId, {})
      setHasApplied(true)
      setShowApplyModal(false)
    } catch (err) {
      console.error('Failed to apply:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading job details...</div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Job not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center gap-2"
        >
          ← Back
        </button>

        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{job.role}</h1>
              <p className="text-xl text-gray-600 mt-2">{job.company}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">{job.domain}</span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">{job.job_type}</span>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">{job.location}</span>
              </div>
            </div>
            <Button
              variant={hasApplied ? 'secondary' : 'primary'}
              size="lg"
              onClick={() => setShowApplyModal(true)}
              disabled={hasApplied}
            >
              {hasApplied ? '✓ Applied' : 'Apply Now'}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 pb-8 border-b">
            <div>
              <p className="text-gray-600 text-sm">Salary/Stipend</p>
              <p className="text-2xl font-bold text-green-600">{job.salary}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Application Deadline</p>
              <p className="text-lg font-semibold text-gray-900">{new Date(job.last_date_to_apply).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Eligibility</p>
              <p className="text-lg font-semibold text-gray-900">{job.eligibility}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About the Role</h2>
            <p className="text-gray-700 leading-relaxed mb-6">{job.description}</p>

            {job.responsibilities && job.responsibilities.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Roles & Responsibilities</h3>
                <ul className="space-y-2 mb-6">
                  {job.responsibilities.map((resp, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-blue-600 font-bold">•</span>
                      {resp}
                    </li>
                  ))}
                </ul>
              </>
            )}

            {job.benefits && job.benefits.length > 0 && (
              <>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Why Join Us?</h3>
                <ul className="space-y-2">
                  {job.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex gap-3 text-gray-700">
                      <span className="text-green-600 font-bold">✓</span>
                      {benefit}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8 pb-8 border-b">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Eligibility</h3>
              <p className="text-gray-700">{job.eligibility}</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {skillMatch && (
            <SkillMatcher
              matchPercentage={skillMatch.match_percentage}
              matchedSkills={skillMatch.matched_skills}
              missingSkills={skillMatch.missing_skills}
            />
          )}
        </div>

        <Modal
          isOpen={showApplyModal}
          title="Apply for Position"
          onClose={() => setShowApplyModal(false)}
          onConfirm={handleApply}
          confirmText="Submit Application"
        >
          <p className="text-gray-700 mb-4">
            Are you sure you want to apply for <strong>{job.role}</strong> at <strong>{job.company}</strong>?
          </p>
          <p className="text-sm text-gray-600 mb-4">
            Make sure your profile and resume are up to date before applying.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Your latest resume will be attached to this application.
          </div>
        </Modal>
      </div>
    </div>
  )
}
