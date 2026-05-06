import React, { useState, useEffect } from 'react'
import { Button } from '../components/Common'
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
        setMessages(res.data.messages)
      } catch (err) {
        console.error('Failed to fetch messages:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [])

  const handlePostMessage = async () => {
    if (newMessage.trim()) {
      try {
        const res = await communityService.postMessage(newMessage)
        setMessages([res.data.message, ...messages])
        setNewMessage('')
      } catch (err) {
        console.error('Failed to post message:', err)
      }
    }
  }

  const handleReply = async (messageId) => {
    if (replyText.trim()) {
      try {
        await communityService.replyToMessage(messageId, replyText)
        // Update reply count
        setMessages(messages.map(m =>
          m.id === messageId ? { ...m, replies: m.replies + 1 } : m
        ))
        // Add reply to local display
        const newReply = {
          author: user?.name || 'You',
          reply: replyText,
          timestamp: new Date().toISOString(),
        }
        setRepliesMap(prev => ({
          ...prev,
          [messageId]: [...(prev[messageId] || []), newReply]
        }))
        setReplyText('')
        setShowReplyForm(null)
      } catch (err) {
        console.error('Failed to post reply:', err)
      }
    }
  }

  const handleDeleteMessage = async (messageId) => {
    try {
      await communityService.deleteMessage(messageId)
      setMessages(messages.filter(m => m.id !== messageId))
    } catch (err) {
      console.error('Failed to delete message:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500 text-lg">Loading community...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Community Forum</h1>
        <p className="text-gray-600 mb-8">Connect with placement coordinators and fellow students</p>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Share Your Questions & Experiences</h3>
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask a question, share tips, or celebrate your success..."
            rows="4"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={() => setNewMessage('')}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <Button onClick={handlePostMessage} disabled={!newMessage.trim()}>
              Post Message
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`rounded-lg shadow-md overflow-hidden ${
                msg.is_coordinator ? 'border-l-4 border-blue-600 bg-blue-50' : 'bg-white'
              }`}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={`https://ui-avatars.com/api/?name=${msg.author}`}
                      alt={msg.author}
                      className="w-10 h-10 rounded-full"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        {msg.author}
                        {msg.is_coordinator && (
                          <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">Coordinator</span>
                        )}
                      </h4>
                      <p className="text-xs text-gray-500">{new Date(msg.timestamp).toLocaleString()}</p>
                    </div>
                  </div>
                  {msg.user_id === user?.id && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="text-red-400 hover:text-red-600 text-sm"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  )}
                </div>

                <p className="text-gray-700 mb-4">{msg.message}</p>

                {/* Show local replies */}
                {repliesMap[msg.id] && repliesMap[msg.id].length > 0 && (
                  <div className="mb-4 ml-6 space-y-2 border-l-2 border-gray-200 pl-4">
                    {repliesMap[msg.id].map((reply, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <img
                            src={`https://ui-avatars.com/api/?name=${reply.author}&size=24`}
                            alt={reply.author}
                            className="w-5 h-5 rounded-full"
                          />
                          <span className="text-sm font-medium text-gray-900">{reply.author}</span>
                          <span className="text-xs text-gray-400">{new Date(reply.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-gray-700">{reply.reply}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => {
                      setShowReplyForm(showReplyForm === msg.id ? null : msg.id)
                      setReplyText('')
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    💬 Reply ({msg.replies})
                  </button>
                </div>

                {showReplyForm === msg.id && (
                  <div className="mt-4 pt-4 border-t">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => { setShowReplyForm(null); setReplyText('') }}
                        className="px-3 py-1 text-gray-700 bg-gray-200 rounded text-sm hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(msg.id)}
                        disabled={!replyText.trim()}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                      >
                        Post Reply
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-yellow-900 mb-3">💡 Community Guidelines</h3>
          <ul className="space-y-2 text-yellow-800 text-sm">
            <li>✓ Be respectful and encouraging to fellow members</li>
            <li>✓ Share genuine experiences and insights</li>
            <li>✓ No spam, promotional content, or harassment</li>
            <li>✓ Keep discussions placement-related</li>
            <li>✓ Help others with your knowledge and experiences</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
