import React, { useEffect, useState } from 'react'
import { Bell, FileText, Loader2, Plus, Upload, X } from 'lucide-react'
import { Button, LoadingState, PageHeader } from '../components/Common'
import { useAuthStore } from '../context/store'
import { authService, notificationService, resumeService } from '../services/api'

export default function ProfilePage() {
  const { updateProfile } = useAuthStore()
  const [profile, setProfile] = useState(null)
  const [editing, setEditing] = useState(false)
  const [formData, setFormData] = useState({})
  const [newSkill, setNewSkill] = useState('')
  const [notifPrefs, setNotifPrefs] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
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
        setNotifPrefs(prefsRes.data.preferences || {})
      } catch (err) {
        console.error('Failed to fetch profile:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target
    setFormData({ ...formData, [name]: value })
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill) return
    const currentSkills = formData.skills || []
    if (currentSkills.some((item) => item.toLowerCase() === skill.toLowerCase())) {
      setNewSkill('')
      return
    }
    setFormData({ ...formData, skills: [...currentSkills, skill] })
    setNewSkill('')
  }

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({ ...formData, skills: (formData.skills || []).filter((skill) => skill !== skillToRemove) })
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await authService.updateProfile(formData)
      setProfile(res.data.user)
      updateProfile(res.data.user)
      setEditing(false)
    } catch (err) {
      console.error('Failed to update profile:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleResumeUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setResumeFile(file)
    setResumeUrl(URL.createObjectURL(file))
    try {
      const uploadRes = await authService.uploadResume(file)
      const nextProfile = { ...profile, resume_uploaded: true, resume_filename: uploadRes.data.filename }
      setProfile(nextProfile)
      setFormData({ ...formData, resume_uploaded: true, resume_filename: uploadRes.data.filename })

      setExtracting(true)
      const parseRes = await resumeService.parseResume(file)
      if (parseRes.data.extracted_skills?.length > 0) {
        setExtractedSkills(parseRes.data.extracted_skills)
        setFormData((prev) => ({ ...prev, skills: parseRes.data.all_skills }))
        setProfile((prev) => ({ ...prev, skills: parseRes.data.all_skills }))
      }

      if (parseRes.data.profile_info) {
        const info = parseRes.data.profile_info
        const updates = {}
        ;['name', 'phone', 'cgpa', 'branch', 'current_year'].forEach((key) => {
          if (info[key]) updates[key] = info[key]
        })
        if (Object.keys(updates).length > 0) {
          setFormData((prev) => ({ ...prev, ...updates }))
          setProfile((prev) => ({ ...prev, ...updates }))
        }
      }
    } catch (err) {
      console.error('Failed to upload or parse resume:', err)
    } finally {
      setExtracting(false)
    }
  }

  const handleNotifPrefChange = async (key) => {
    const updated = { ...notifPrefs, [key]: !notifPrefs[key] }
    setNotifPrefs(updated)
    try {
      await notificationService.updatePreferences(updated)
    } catch (err) {
      console.error('Failed to update notification preferences:', err)
    }
  }

  if (loading) return <LoadingState label="Loading profile" />

  const visibleSkills = editing ? formData.skills || [] : profile?.skills || []

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-5xl">
        <PageHeader
          eyebrow="Account"
          title="Profile"
          description="Keep your academic details, skills, resume, and notifications ready for applications."
          actions={(
            <div className="flex gap-2">
              {editing && <Button variant="secondary" onClick={() => { setEditing(false); setFormData(profile) }}>Cancel</Button>}
              <Button onClick={() => editing ? handleSave() : setEditing(true)} variant={editing ? 'success' : 'primary'} loading={saving}>
                {editing ? 'Save changes' : 'Edit profile'}
              </Button>
            </div>
          )}
        />

        <section className="section-card mb-6 p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
              <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'Student')}&size=96&background=2557d6&color=fff`} alt="" className="h-20 w-20 rounded-lg" />
              <div className="min-w-0">
                <h2 className="truncate text-2xl font-bold text-foreground">{profile?.name}</h2>
                <p className="mt-1 text-sm font-medium text-secondary-foreground">{profile?.branch || 'Branch not set'} · {profile?.current_year || 'Year not set'}</p>
                <p className="mt-1 truncate text-sm text-secondary-foreground">{profile?.email}</p>
              </div>
            </div>
            <div className="rounded-lg border border-secondary-border bg-slate-50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-secondary-foreground">Resume</p>
              <p className="mt-1 text-sm font-bold text-foreground">{profile?.resume_uploaded ? 'Uploaded' : 'Missing'}</p>
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="space-y-6">
            <section className="section-card p-5 sm:p-6">
              <h3 className="mb-5 text-lg font-bold text-foreground">Personal details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name" name="name" value={editing ? formData.name || '' : profile?.name || ''} onChange={handleInputChange} disabled={!editing} />
                <Field label="Email" value={profile?.email || ''} disabled />
                <Field label="Phone" name="phone" value={editing ? formData.phone || '' : profile?.phone || ''} onChange={handleInputChange} disabled={!editing} type="tel" />
                <Field label="CGPA" name="cgpa" value={editing ? formData.cgpa || '' : profile?.cgpa || ''} onChange={handleInputChange} disabled={!editing} type="number" step="0.01" />
              </div>
            </section>

            <section className="section-card p-5 sm:p-6">
              <h3 className="mb-5 text-lg font-bold text-foreground">Academic details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Branch" name="branch" value={editing ? formData.branch || '' : profile?.branch || ''} onChange={handleInputChange} disabled={!editing} />
                <Field label="Current year" name="current_year" value={editing ? formData.current_year || '' : profile?.current_year || ''} onChange={handleInputChange} disabled={!editing} />
              </div>
            </section>

            <section className="section-card p-5 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-foreground">Skills</h3>
                  <p className="mt-1 text-sm text-secondary-foreground">Used for job matching and skill coverage.</p>
                </div>
                <span className="status-pill border-slate-200 bg-slate-50 text-slate-700">{visibleSkills.length} skills</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {visibleSkills.length > 0 ? visibleSkills.map((skill) => (
                  <span key={skill} className="status-pill border-blue-200 bg-blue-50 text-blue-700">
                    {skill}
                    {editing && (
                      <button type="button" onClick={() => handleRemoveSkill(skill)} className="ml-1 rounded-full p-0.5 hover:bg-blue-100" aria-label={`Remove ${skill}`}>
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </span>
                )) : (
                  <p className="text-sm text-secondary-foreground">No skills added yet.</p>
                )}
              </div>

              {editing && (
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <input value={newSkill} onChange={(event) => setNewSkill(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter') { event.preventDefault(); handleAddSkill() } }} placeholder="Add a skill" className="field-input" />
                  <Button type="button" onClick={handleAddSkill}><Plus className="h-4 w-4" /> Add</Button>
                </div>
              )}
            </section>
          </div>

          <aside className="space-y-6">
            <section className="section-card p-5">
              <h3 className="text-lg font-bold text-foreground">Resume</h3>
              <div className="mt-4 rounded-lg border border-dashed border-secondary-border bg-slate-50 p-4">
                {profile?.resume_uploaded ? (
                  <button type="button" onClick={() => setShowResumeViewer(true)} className="flex w-full items-center gap-3 rounded-lg bg-white p-3 text-left transition hover:bg-secondary">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-red-50 text-red-700"><FileText className="h-5 w-5" /></div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">{profile?.resume_filename || 'Resume.pdf'}</p>
                      <p className="mt-1 text-xs text-secondary-foreground">Open preview</p>
                    </div>
                  </button>
                ) : (
                  <div className="text-center">
                    <FileText className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold text-foreground">No resume uploaded</p>
                    <p className="mt-1 text-xs text-secondary-foreground">Upload a PDF while editing.</p>
                  </div>
                )}

                {editing && (
                  <label className="btn-secondary mt-4 w-full cursor-pointer">
                    <Upload className="h-4 w-4" /> {profile?.resume_uploaded ? 'Replace PDF' : 'Upload PDF'}
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} className="hidden" />
                  </label>
                )}
              </div>

              {extracting && (
                <div className="mt-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Extracting skills from resume
                </div>
              )}
              {extractedSkills.length > 0 && !extracting && (
                <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                  <p className="text-sm font-semibold text-emerald-800">{extractedSkills.length} skills extracted</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {extractedSkills.map((skill) => <span key={skill} className="status-pill border-emerald-200 bg-white text-emerald-700">{skill}</span>)}
                  </div>
                </div>
              )}
            </section>

            <section className="section-card p-5">
              <div className="mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Notifications</h3>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'New job emails', id: 'email_jobs', description: 'Receive jobs that match your profile.' },
                  { label: 'Application updates', id: 'push_updates', description: 'Get notified when statuses change.' },
                  { label: 'Deadline reminders', id: 'deadline_emails', description: 'Avoid missing closing dates.' },
                  { label: 'Placement newsletter', id: 'newsletter', description: 'Occasional summaries and guidance.' }
                ].map((pref) => (
                  <label key={pref.id} className="flex cursor-pointer items-start justify-between gap-4 rounded-lg border border-secondary-border bg-slate-50 p-3">
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{pref.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-secondary-foreground">{pref.description}</span>
                    </span>
                    <input type="checkbox" checked={notifPrefs[pref.id] || false} onChange={() => handleNotifPrefChange(pref.id)} className="mt-1 h-4 w-4 rounded border-secondary-border text-primary focus:ring-primary" />
                  </label>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>

      {showResumeViewer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-sm">
          <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-lg border border-card-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-secondary-border px-5 py-4">
              <div>
                <h3 className="font-bold text-foreground">Resume preview</h3>
                <p className="mt-0.5 text-xs text-secondary-foreground">{profile?.resume_filename || 'Resume.pdf'}</p>
              </div>
              <button type="button" onClick={() => setShowResumeViewer(false)} className="rounded-lg p-2 text-secondary-foreground hover:bg-secondary hover:text-foreground" aria-label="Close preview">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid min-h-[520px] flex-1 overflow-hidden lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="bg-slate-100">
                {resumeUrl ? (
                  <iframe src={resumeUrl} className="h-full min-h-[520px] w-full" title="Resume PDF preview" />
                ) : (
                  <div className="flex h-full min-h-[520px] items-center justify-center text-center">
                    <div>
                      <FileText className="mx-auto h-12 w-12 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-foreground">Preview unavailable</p>
                      <p className="mt-1 text-xs text-secondary-foreground">Upload or replace the PDF to preview it here.</p>
                    </div>
                  </div>
                )}
              </div>
              <aside className="border-t border-secondary-border bg-white p-5 lg:border-l lg:border-t-0">
                <h4 className="text-sm font-bold text-foreground">Extracted skills</h4>
                <div className="mt-3 flex flex-wrap gap-2">
                  {extractedSkills.length > 0 ? extractedSkills.map((skill) => (
                    <span key={skill} className="status-pill border-emerald-200 bg-emerald-50 text-emerald-700">{skill}</span>
                  )) : (
                    <p className="text-sm leading-6 text-secondary-foreground">Skills extracted in this session will appear here.</p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Field({ label, name, value, onChange, disabled, type = 'text', step }) {
  return (
    <div>
      <label className="field-label">{label}</label>
      <input type={type} step={step} name={name} value={value} onChange={onChange} disabled={disabled} className="field-input" />
    </div>
  )
}
