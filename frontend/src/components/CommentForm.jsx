import { useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

export default function CommentForm({ postId, onCommentAdded }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return

    setSubmitting(true)
    setError('')
    try {
      const res = await client.post(`/posts/${postId}/comments`, { body })
      onCommentAdded(res.data.data)
      setBody('')
    } catch {
      setError('Could not post your comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      <Avatar name={user?.name} src={user?.avatar_url} size="sm" />
      <div className="flex-1">
        <div className="flex gap-2">
          <input
            type="text"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a comment, also there's a new feature u can comment image link using html tags!"
            maxLength={2000}
            className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          <button
            type="submit"
            disabled={!body.trim() || submitting}
            className="rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting ? '…' : 'Send'}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </div>
    </form>
  )
}
