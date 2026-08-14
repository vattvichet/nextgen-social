import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/format'
import { getTextPinStyle } from '../lib/pinStyle'
import Avatar from './Avatar'
import { CommentIcon, StackIcon, TrashIcon } from './icons'

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth()
  const isOwner = user?.id === post.user.id
  const textStyle = getTextPinStyle(post.id)
  const cover = post.images?.[0]
  const hasMultipleImages = (post.images?.length ?? 0) > 1

  function handleDelete(e) {
    e.preventDefault()
    e.stopPropagation()
    onDelete(post.id)
  }

  return (
    <article className="group mb-4 break-inside-avoid overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm transition-all duration-200 hover:shadow-lg">
      <Link to={`/posts/${post.id}`} className="block">
        <div className="relative overflow-hidden">
          {cover ? (
            <img
              src={cover.url}
              alt=""
              loading="lazy"
              className="max-h-[32rem] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className={`flex min-h-36 items-center bg-gradient-to-br p-5 ${textStyle}`}>
              <p className="line-clamp-6 whitespace-pre-wrap text-[0.95rem] font-medium leading-relaxed">
                {post.body}
              </p>
            </div>
          )}

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          {hasMultipleImages && (
            <div className="pointer-events-none absolute left-2.5 top-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              <StackIcon className="h-3.5 w-3.5" />
              {post.images.length}
            </div>
          )}

          {isOwner && onDelete && (
            <button
              onClick={handleDelete}
              aria-label="Delete post"
              className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-500 opacity-0 shadow-sm backdrop-blur transition-all duration-150 hover:bg-white hover:text-red-600 group-hover:opacity-100"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          )}

          {post.comments_count > 0 && (
            <div className="pointer-events-none absolute bottom-2.5 left-2.5 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              <CommentIcon className="h-3.5 w-3.5" />
              {post.comments_count}
            </div>
          )}
        </div>

        {cover && (
          <p className="line-clamp-3 whitespace-pre-wrap px-3.5 pt-3 text-sm leading-snug text-slate-800">
            {post.body}
          </p>
        )}
      </Link>

      <Link
        to={`/users/${post.user.id}`}
        className="flex items-center gap-2 px-3.5 py-3 transition-colors hover:bg-slate-50"
      >
        <Avatar name={post.user.name} src={post.user.avatar_url} size="sm" />
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">{post.user.name}</p>
          <p className="text-[0.7rem] text-slate-400">{formatRelativeTime(post.created_at)}</p>
        </div>
      </Link>
    </article>
  )
}
