import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/format'
import Avatar from './Avatar'

export default function CommentList({ comments, onDelete, postAuthorId }) {
  const { user } = useAuth()

  if (comments.length === 0) {
    return <p className="py-6 text-center text-sm text-slate-400">No comments yet. Start the conversation.</p>
  }

  return (
    <ul className="space-y-3">
      {comments.map((comment) => (
        <li key={comment.id} className="flex items-start gap-3">
          <Link to={`/users/${comment.user.id}`} className="shrink-0 transition hover:opacity-80">
            <Avatar name={comment.user.name} src={comment.user.avatar_url} size="sm" />
          </Link>
          <div className="flex-1 rounded-2xl bg-slate-100 px-4 py-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Link to={`/users/${comment.user.id}`} className="text-sm font-semibold text-slate-900 hover:text-brand-600">
                  {comment.user.name}
                </Link>
                {comment.user.id === postAuthorId && (
                  <span className="rounded-full bg-brand-600 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide text-white">
                    Author
                  </span>
                )}
              </div>
              {user?.id === comment.user.id && onDelete && (
                <button
                  onClick={() => onDelete(comment.id)}
                  className="text-xs font-medium text-slate-400 hover:text-red-600"
                >
                  Delete
                </button>
              )}
            </div>
{/* INTENTIONALLY VULNERABLE — for the security demo. Real apps should
    sanitize (e.g. DOMPurify) or avoid dangerouslySetInnerHTML entirely
    for user-generated content. */}
<p
  className="text-sm text-slate-700"
  dangerouslySetInnerHTML={{ __html: comment.body }}
/>
            <p className="mt-0.5 text-xs text-slate-400">{formatRelativeTime(comment.created_at)}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
