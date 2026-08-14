import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { extractErrorMessage } from '../lib/errors'
import { formatRelativeTime } from '../lib/format'
import { getTextPinStyle } from '../lib/pinStyle'
import Avatar from './Avatar'
import CommentForm from './CommentForm'
import CommentList from './CommentList'
import { ArrowLeftIcon, BookmarkIcon, ChevronLeftIcon, ChevronRightIcon, HeartIcon, TrashIcon } from './icons'

/**
 * The post + comments card shown on the full post-detail page and reused
 * inside the feed's popup modal. `onBack` is called both for the back/close
 * arrow and after a successful delete. `onPostChange` lets a parent (e.g.
 * the feed) keep its own copy of the post's comment count in sync.
 */
const SWIPE_THRESHOLD = 40

export default function PostDetailCard({ postId, onBack, onPostChange, onDeleted }) {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeImage, setActiveImage] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef(null)
  const likeDebounceRef = useRef(null)

  useEffect(() => {
    setLoading(true)
    setError('')
    setActiveImage(0)
    client
      .get(`/posts/${postId}`)
      .then((res) => setPost(res.data.data))
      .catch(() => setError('This post could not be found.'))
      .finally(() => setLoading(false))
  }, [postId])

  useEffect(() => {
    return () => clearTimeout(likeDebounceRef.current)
  }, [])

  useEffect(() => {
    if (post) onPostChange?.(post)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post])

  function handleCommentAdded(comment) {
    setPost((prev) => ({
      ...prev,
      comments: [comment, ...prev.comments],
      comments_count: prev.comments_count + 1,
    }))
  }

  async function handleCommentDelete(commentId) {
    try {
      await client.delete(`/comments/${commentId}`)
      setPost((prev) => ({
        ...prev,
        comments: prev.comments.filter((c) => c.id !== commentId),
        comments_count: prev.comments_count - 1,
      }))
    } catch {
      setError('Could not delete the comment.')
    }
  }

  async function handlePostDelete() {
    if (!window.confirm('Delete this post?')) return
    try {
      await client.delete(`/posts/${postId}`)
      onDeleted?.(postId)
      onBack()
    } catch {
      setError('Could not delete the post.')
    }
  }

  async function handleToggleSave() {
    const nextSaved = !post.is_saved
    setPost((prev) => ({ ...prev, is_saved: nextSaved }))
    try {
      if (nextSaved) {
        await client.post(`/posts/${postId}/save`)
        showToast('Post saved')
      } else {
        await client.delete(`/posts/${postId}/save`)
        showToast('Removed from saved')
      }
    } catch {
      setPost((prev) => ({ ...prev, is_saved: !nextSaved }))
      setError('Could not update saved status.')
    }
  }

  function handleToggleLike() {
    const nextLiked = !post.is_liked
    setPost((prev) => ({
      ...prev,
      is_liked: nextLiked,
      likes_count: (prev.likes_count ?? 0) + (nextLiked ? 1 : -1),
    }))

    clearTimeout(likeDebounceRef.current)
    likeDebounceRef.current = setTimeout(async () => {
      try {
        if (nextLiked) {
          await client.post(`/posts/${postId}/like`)
        } else {
          await client.delete(`/posts/${postId}/like`)
        }
      } catch (err) {
        setPost((prev) => ({
          ...prev,
          is_liked: !nextLiked,
          likes_count: (prev.likes_count ?? 0) + (nextLiked ? -1 : 1),
        }))
        if (err.response?.status === 429) {
          showToast(extractErrorMessage(err, "You're liking too fast. Please slow down."))
        } else {
          setError('Could not update like status.')
        }
      }
    }, 400)
  }

  const images = post?.images ?? []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1

  function handlePointerDown(e) {
    if (!hasMultipleImages) return
    if (e.target.closest('button')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.pointerType === 'mouse') e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY }
    setIsDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) < Math.abs(dy)) return
    let adjusted = dx
    if (dx > 0 && activeImage === 0) adjusted = dx * 0.35
    if (dx < 0 && activeImage === images.length - 1) adjusted = dx * 0.35
    setDragOffset(adjusted)
  }

  function endDrag(e) {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setIsDragging(false)
    if (Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      setActiveImage((i) => {
        if (dx < 0) return Math.min(i + 1, images.length - 1)
        return Math.max(i - 1, 0)
      })
    }
    setDragOffset(0)
    dragStart.current = null
  }

  return (
    <>
      {loading ? (
        <div className="flex justify-center py-24">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : error && !post ? (
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      ) : (
        post && (
          <div className="overflow-hidden rounded-3xl bg-white shadow-sm md:grid md:grid-cols-2">
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endDrag}
              onPointerCancel={endDrag}
              style={{ touchAction: 'pan-y' }}
              className={`group relative h-72 select-none overflow-hidden bg-slate-50 md:h-[600px] ${
                hasMultipleImages ? 'cursor-grab active:cursor-grabbing' : ''
              }`}
            >
              <button
                onClick={onBack}
                aria-label="Back"
                className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-slate-600 shadow-sm backdrop-blur transition hover:bg-white hover:text-brand-600"
              >
                <ArrowLeftIcon className="h-[18px] w-[18px]" />
              </button>

              {hasImages ? (
                <>
                  <div
                    className="flex h-full"
                    style={{
                      transform: `translateX(calc(${-activeImage * 100}% + ${dragOffset}px))`,
                      transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
                    }}
                  >
                    {images.map((img) => (
                      <img
                        key={img.id}
                        src={img.url}
                        alt=""
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        className="h-full w-full flex-none object-contain"
                      />
                    ))}
                  </div>

                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                        aria-label="Previous image"
                        className="absolute left-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm backdrop-blur transition-all duration-150 hover:bg-white hover:text-brand-600 group-hover:opacity-100"
                      >
                        <ChevronLeftIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                        aria-label="Next image"
                        className="absolute right-4 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm backdrop-blur transition-all duration-150 hover:bg-white hover:text-brand-600 group-hover:opacity-100"
                      >
                        <ChevronRightIcon className="h-5 w-5" />
                      </button>

                      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                        {images.map((img, i) => (
                          <button
                            key={img.id}
                            onClick={() => setActiveImage(i)}
                            aria-label={`View image ${i + 1}`}
                            className={`h-1.5 rounded-full transition-all ${
                              i === activeImage ? 'w-5 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div
                  className={`flex h-full items-center overflow-y-auto bg-gradient-to-br p-10 ${getTextPinStyle(post.id)}`}
                >
                  <p className="whitespace-pre-wrap text-2xl font-medium leading-relaxed">{post.body}</p>
                </div>
              )}
            </div>

            <div className="flex min-h-80 flex-col p-6 md:h-[600px] md:overflow-y-auto">
              <div className="flex items-start justify-between">
                <Link to={`/users/${post.user.id}`} className="flex items-center gap-3 transition hover:opacity-80">
                  <Avatar name={post.user.name} src={post.user.avatar_url} />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{post.user.name}</p>
                    <p className="text-xs text-slate-400">{formatRelativeTime(post.created_at)}</p>
                  </div>
                </Link>

                <div className="flex items-center gap-1">
                  {user && (
                    <button
                      onClick={handleToggleLike}
                      aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                        post.is_liked
                          ? 'text-red-500 hover:bg-red-50'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-red-500'
                      }`}
                    >
                      <HeartIcon filled={post.is_liked} className="h-4 w-4" />
                    </button>
                  )}

                  {user && (
                    <button
                      onClick={handleToggleSave}
                      aria-label={post.is_saved ? 'Unsave post' : 'Save post'}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition ${
                        post.is_saved
                          ? 'text-brand-600 hover:bg-brand-50'
                          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-600'
                      }`}
                    >
                      <BookmarkIcon filled={post.is_saved} className="h-4 w-4" />
                    </button>
                  )}

                  {user?.id === post.user.id && (
                    <button
                      onClick={handlePostDelete}
                      aria-label="Delete post"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {post.likes_count > 0 && (
                <p className="mt-3 text-sm font-semibold text-slate-900">
                  {post.likes_count} like{post.likes_count === 1 ? '' : 's'}
                </p>
              )}

              {hasImages && (
                <p className="mt-2 whitespace-pre-wrap text-[0.95rem] leading-relaxed text-slate-800">
                  {post.body}
                </p>
              )}

              <div className="mt-6 flex-1 border-t border-slate-100 pt-5">
                <h2 className="mb-4 text-sm font-semibold text-slate-900">
                  {post.comments_count} Comment{post.comments_count === 1 ? '' : 's'}
                </h2>

                <div className="mb-5">
                  {user ? (
                    <CommentForm postId={post.id} onCommentAdded={handleCommentAdded} />
                  ) : (
                    <div className="flex items-center justify-between gap-3 rounded-2xl bg-slate-100 px-4 py-3">
                      <p className="text-sm text-slate-600">Log in to leave a comment.</p>
                      <Link
                        to="/login"
                        className="shrink-0 rounded-full bg-brand-600 px-3.5 py-1.5 text-xs font-semibold text-white transition hover:bg-brand-700"
                      >
                        Log in
                      </Link>
                    </div>
                  )}
                </div>

                {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

                <CommentList comments={post.comments} onDelete={handleCommentDelete} postAuthorId={post.user.id} />
              </div>
            </div>
          </div>
        )
      )}
    </>
  )
}
