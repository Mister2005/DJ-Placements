import React, { useEffect, useState } from 'react'
import { MessageSquare, Send, Trash2 } from 'lucide-react'
import { Button, EmptyState, LoadingState, PageHeader } from '../components/Common'
import { communityService } from '../services/api'
import { useAuthStore } from '../context/store'

export default function CommunityPage() {
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [showReplyForm, setShowReplyForm] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [repliesMap, setRepliesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const { user } = useAuthStore()

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await communityService.getMessages()
        setMessages(res.data.messages || [])
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  const handlePostMessage = async () => {
    if (!newMessage.trim()) return
    try {
      const res = await communityService.postMessage(newMessage)
      setMessages([res.data.message, ...messages])
      setNewMessage('')
    } catch (err) {
      console.error('Failed to post message:', err)
    }
  }

  const handleReply = async (messageId) => {
    if (!replyText.trim()) return
    try {
      await communityService.replyToMessage(messageId, replyText)
      setMessages(messages.map((message) => message.id === messageId ? { ...message, replies: message.replies + 1 } : message))
      setRepliesMap((prev) => ({
        ...prev,
        [messageId]: [...(prev[messageId] || []), { author: user?.name || 'You', reply: replyText, timestamp: new Date().toISOString() }]
      }))
      setReplyText('')
      setShowReplyForm(null)
    } catch (err) {
      console.error('Failed to post reply:', err)
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await communityService.deleteMessage(messageId)
      setMessages(messages.filter((message) => message.id !== messageId))
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  if (loading) return <LoadingState label="Loading community" />

  return (
    <main className="page-shell">
      <div className="mx-auto w-full max-w-4xl">
        <PageHeader
          eyebrow="Community"
          title="Placement forum"
          description="Ask practical questions, share interview context, and keep discussion focused on placements."
        />

        <section className="section-card mb-6 p-5">
          <label className="field-label" htmlFor="community-post">Start a discussion</label>
          <textarea
            id="community-post"
            value={newMessage}
            onChange={(event) => setNewMessage(event.target.value)}
            placeholder="Ask a question or share a placement update..."
            rows="4"
            className="field-input resize-none"
          />
          <div className="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-secondary-foreground">{newMessage.trim().length} characters</p>
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setNewMessage('')} disabled={!newMessage}>Clear</Button>
              <Button onClick={handlePostMessage} disabled={!newMessage.trim()}><Send className="h-4 w-4" /> Post</Button>
            </div>
          </div>
        </section>

        {messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <article key={message.id} className={`section-card overflow-hidden ${message.is_coordinator ? 'border-blue-200' : ''}`}>
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(message.author)}&background=2557d6&color=fff`} alt="" className="h-10 w-10 rounded-lg" />
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="truncate text-sm font-bold text-foreground">{message.author}</h2>
                          {message.is_coordinator && <span className="status-pill border-blue-200 bg-blue-50 text-blue-700">Coordinator</span>}
                        </div>
                        <p className="mt-1 text-xs text-secondary-foreground">{new Date(message.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                    {message.user_id === user?.id && (
                      <button type="button" onClick={() => handleDeleteMessage(message.id)} className="rounded-lg p-2 text-secondary-foreground transition hover:bg-red-50 hover:text-red-700" aria-label="Delete message">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.message}</p>

                  {repliesMap[message.id]?.length > 0 && (
                    <div className="mt-5 space-y-3 border-l-2 border-secondary-border pl-4">
                      {repliesMap[message.id].map((reply, index) => (
                        <div key={`${reply.timestamp}-${index}`} className="rounded-lg border border-secondary-border bg-slate-50 p-3">
                          <p className="text-xs font-semibold text-foreground">{reply.author}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-700">{reply.reply}</p>
                          <p className="mt-2 text-xs text-secondary-foreground">{new Date(reply.timestamp).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-5 border-t border-secondary-border pt-4">
                    <button type="button" onClick={() => { setShowReplyForm(showReplyForm === message.id ? null : message.id); setReplyText('') }} className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-primary transition hover:bg-blue-50">
                      <MessageSquare className="h-4 w-4" /> Reply ({message.replies})
                    </button>
                  </div>

                  {showReplyForm === message.id && (
                    <div className="mt-4 rounded-lg border border-secondary-border bg-slate-50 p-4">
                      <textarea value={replyText} onChange={(event) => setReplyText(event.target.value)} placeholder="Write a focused reply..." rows="3" className="field-input resize-none bg-white" />
                      <div className="mt-3 flex justify-end gap-2">
                        <Button variant="secondary" size="sm" onClick={() => { setShowReplyForm(null); setReplyText('') }}>Cancel</Button>
                        <Button size="sm" onClick={() => handleReply(message.id)} disabled={!replyText.trim()}>Post reply</Button>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <EmptyState icon={MessageSquare} title="No discussions yet" description="Start the first thread with a placement question, interview update, or deadline clarification." />
        )}

        <section className="section-card mt-8 p-5">
          <h3 className="text-lg font-bold text-foreground">Forum standards</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {['Be specific about company, role, and round when asking for help.', 'Share only information you are allowed to share.', 'Keep replies practical and placement-related.', 'Report issues to coordinators instead of escalating threads.'].map((item) => (
              <p key={item} className="rounded-lg border border-secondary-border bg-slate-50 p-3 text-sm leading-6 text-slate-700">{item}</p>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
