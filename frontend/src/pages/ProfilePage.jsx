import React, { useState, useEffect } from 'react'
import { Button } from '../components/Common'
import { useAuthStore } from '../context/store'
import { authService, notificationService, resumeService } from '../services/api'

export default function ProfilePage() {
  const { user, updateProfile } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [newSkill, setNewSkill] = useState('')
  const [notifPrefs, setNotifPrefs] = useState({})
  const [loading, setLoading] = useState(true)
  const [showResumeViewer, setShowResumeViewer] = useState(false)
  const [resumeFile, setResumeFile] = useState(null)
  const [resumeUrl, setResumeUrl] = useState(null)
  const [extracting, setExtracting] = useState(false)
  const [extractedSkills, setExtractedSkills] = useState([])

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, prefsRes] = await Promise.all([
          authService.getProfile(),
          notificationService.getPreferences()
        ])
        setProfile(profileRes.data.user)
        setFormData(profileRes.data.user)
        setNotifPrefs(prefsRes.data.preferences)
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        skills: [...(formData.skills || []), newSkill.trim()]
      })
      setNewSkill('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    })
  }

  const handleSave = async () => {
    try {
      const res = await authService.updateProfile(formData)
      setProfile(res.data.user)
      updateProfile(res.data.user)
      setEditing(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
    }
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0]
    if (file) {
      setResumeFile(file)
      setResumeUrl(URL.createObjectURL(file))
      try {
        // Upload the resume
        const uploadRes = await authService.uploadResume(file)
        setProfile({ ...profile, resume_uploaded: true, resume_filename: uploadRes.data.filename })
        setFormData({ ...formData, resume_uploaded: true, resume_filename: uploadRes.data.filename })

        // AI: Extract skills from resume
        setExtracting(true)
        const parseRes = await resumeService.parseResume(file)
        if (parseRes.data.extracted_skills && parseRes.data.extracted_skills.length > 0) {
          setExtractedSkills(parseRes.data.extracted_skills)
          setFormData(prev => ({ ...prev, skills: parseRes.data.all_skills }))
          setProfile(prev => ({ ...prev, skills: parseRes.data.all_skills }))
        }
        // Auto-fill profile fields from resume
        if (parseRes.data.profile_info) {
          const info = parseRes.data.profile_info
          const updates = {}
          if (info.name) updates.name = info.name
          if (info.phone) updates.phone = info.phone
          if (info.cgpa) updates.cgpa = info.cgpa
          if (info.branch) updates.branch = info.branch
          if (info.current_year) updates.current_year = info.current_year
          if (Object.keys(updates).length > 0) {
            setFormData(prev => ({ ...prev, ...updates }))
            setProfile(prev => ({ ...prev, ...updates }))
          }
        }
      } catch (err) {
        console.error('Failed to upload/parse resume:', err)
      } finally {
        setExtracting(false)
      }
    }
  }

  const handleNotifPrefChange = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    try {
      await notificationService.updatePreferences(updated)
    } catch (err) {
      console.error('Failed to update preferences:', err)
    }
  }

  const handleViewResume = () => {
    if (resumeUrl) {
      setShowResumeViewer(true)
    } else if (resumeFile) {
      setResumeUrl(URL.createObjectURL(resumeFile))
      setShowResumeViewer(true)
    } else {
      setShowResumeViewer(true)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading profile...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center justify-between mb-8 pb-8 border-b">
            <div className="flex items-center gap-6">
              <img
                src={`https://ui-avatars.com/api/?name=${profile?.name}&size=100`}
                alt={profile?.name}
                className="w-24 h-24 rounded-full"
              />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                <p className="text-gray-600">{profile?.branch} • {profile?.current_year}</p>
                <p className="text-sm text-gray-500 mt-1">{profile?.email}</p>
              </div>
            </div>
            <Button
              onClick={() => {
                if (editing) handleSave()
                else setEditing(true)
              }}
              variant={editing ? 'success' : 'primary'}
            >
              {editing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editing ? formData.name || '' : profile?.name || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={editing ? formData.phone || '' : profile?.phone || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">CGPA</label>
                <input
                  type="number"
                  name="cgpa"
                  value={editing ? formData.cgpa || '' : profile?.cgpa || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="mb-8 pb-8 border-b">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Academic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <input
                  type="text"
                  name="branch"
                  value={editing ? formData.branch || '' : profile?.branch || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Year</label>
                <input
                  type="text"
                  name="current_year"
                  value={editing ? formData.current_year || '' : profile?.current_year || ''}
                  onChange={handleInputChange}
                  disabled={!editing}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              {(editing ? formData.skills : profile?.skills || []).map((skill) => (
                <div key={skill} className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {skill}
                  {editing && (
                    <button onClick={() => handleRemoveSkill(skill)} className="ml-1 hover:text-blue-900 font-bold">×</button>
                  )}
                </div>
              ))}
            </div>
            {editing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a new skill"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                />
                <Button onClick={handleAddSkill}>Add</Button>
              </div>
            )}
          </div>

          {/* Resume Section */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Resume</h3>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              {profile?.resume_uploaded ? (
                <div className="flex items-center justify-between">
                  <div
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg flex-1"
                    onClick={handleViewResume}
                  >
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600 font-bold text-sm">PDF</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                        {profile?.resume_filename || 'Resume.pdf'}
                      </p>
                      <p className="text-xs text-gray-500">Click to view • PDF format</p>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </div>
                  {editing && (
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium ml-3">
                      Replace
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  )}
                </div>
              ) : (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-gray-500 mb-2">No resume uploaded yet</p>
                  {editing ? (
                    <label className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium inline-block">
                      Upload Resume (PDF)
                      <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                    </label>
                  ) : (
                    <p className="text-xs text-gray-400">Click "Edit Profile" to upload</p>
                  )}
                </div>
              )}
            </div>
            {/* AI Skill Extraction Status */}
            {extracting && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
                <span className="animate-spin">⚙️</span>
                <span className="text-sm text-blue-700">AI is extracting skills from your resume...</span>
              </div>
            )}
            {extractedSkills.length > 0 && !extracting && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-green-800 mb-2">✓ AI extracted {extractedSkills.length} skills from your resume:</p>
                <div className="flex flex-wrap gap-1.5">
                  {extractedSkills.map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">{skill}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
          <div className="space-y-3">
            {[
              { label: 'Email notifications for new jobs', id: 'email_jobs' },
              { label: 'Push notifications for application updates', id: 'push_updates' },
              { label: 'Deadline reminder emails', id: 'deadline_emails' },
              { label: 'Newsletter and updates', id: 'newsletter' }
            ].map((pref) => (
              <label key={pref.id} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifPrefs[pref.id] || false}
                  onChange={() => handleNotifPrefChange(pref.id)}
                  className="w-4 h-4 rounded"
                />
                <span className="text-gray-700">{pref.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Resume Viewer Modal */}
      {showResumeViewer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-bold text-gray-900">📄 Resume Preview — {profile?.resume_filename}</h3>
              <button
                onClick={() => setShowResumeViewer(false)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden flex">
              {/* PDF Preview */}
              <div className="flex-1 bg-gray-100">
                {resumeUrl ? (
                  <iframe
                    src={resumeUrl}
                    className="w-full h-full min-h-[500px]"
                    title="Resume PDF Preview"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[500px]">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                        <span className="text-red-600 font-bold text-xl">PDF</span>
                      </div>
                      <p className="text-gray-500">Upload a resume to see preview here</p>
                    </div>
                  </div>
                )}
              </div>
              {/* Extracted Info Sidebar */}
              {extractedSkills.length > 0 && (
                <div className="w-64 border-l p-4 overflow-y-auto bg-gray-50">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    🤖 AI Extracted Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {extractedSkills.map((skill, idx) => (
                      <span key={idx} className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-4">
                    These skills were automatically extracted from your resume and added to your profile.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
