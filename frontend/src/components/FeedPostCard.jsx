import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/format'
import { getTextPinStyle } from '../lib/pinStyle'
import Avatar from './Avatar'
import {
  BookmarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CommentIcon,
  HeartIcon,
  StackIcon,
  TrashIcon,
  ZoomIcon,
} from './icons'

const SWIPE_THRESHOLD = 40

export default function FeedPostCard({ post, onDelete, onOpenPost, onToggleSave, onToggleLike }) {
  const { user } = useAuth()
  const isOwner = user?.id === post.user.id
  const textStyle = getTextPinStyle(post.id)
  const images = post.images ?? []
  const hasImages = images.length > 0
  const hasMultipleImages = images.length > 1
  const [activeIndex, setActiveIndex] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  const dragStart = useRef(null)
  const didSwipe = useRef(false)

  function handleDelete(e) {
    e.stopPropagation()
    onDelete(post.id)
  }

  function handleToggleSave(e) {
    e.stopPropagation()
    onToggleSave(post.id, !post.is_saved)
  }

  function handleToggleLike(e) {
    e.stopPropagation()
    onToggleLike(post.id, !post.is_liked)
  }

  function handleOpen() {
    onOpenPost(post.id)
  }

  function goToImage(e, index) {
    e.stopPropagation()
    setActiveIndex(index)
  }

  function goPrev(e) {
    e.stopPropagation()
    setActiveIndex((i) => (i - 1 + images.length) % images.length)
  }

  function goNext(e) {
    e.stopPropagation()
    setActiveIndex((i) => (i + 1) % images.length)
  }

  function handlePointerDown(e) {
    if (!hasMultipleImages) return
    if (e.target.closest('button')) return
    if (e.pointerType === 'mouse' && e.button !== 0) return
    if (e.pointerType === 'mouse') e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    dragStart.current = { x: e.clientX, y: e.clientY }
    didSwipe.current = false
    setIsDragging(true)
  }

  function handlePointerMove(e) {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
      didSwipe.current = true
    }
    if (Math.abs(dx) < Math.abs(dy)) return
    let adjusted = dx
    if (dx > 0 && activeIndex === 0) adjusted = dx * 0.35
    if (dx < 0 && activeIndex === images.length - 1) adjusted = dx * 0.35
    setDragOffset(adjusted)
  }

  function endDrag(e) {
    if (!dragStart.current) return
    const dx = e.clientX - dragStart.current.x
    const dy = e.clientY - dragStart.current.y
    setIsDragging(false)
    if (hasMultipleImages && Math.abs(dx) > SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
      setActiveIndex((i) => {
        if (dx < 0) return Math.min(i + 1, images.length - 1)
        return Math.max(i - 1, 0)
      })
    }
    setDragOffset(0)
    dragStart.current = null
  }

  function handleMediaClick() {
    if (didSwipe.current) {
      didSwipe.current = false
      return
    }
    handleOpen()
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200/60 bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <Link to={`/users/${post.user.id}`} className="flex items-center gap-2.5 transition hover:opacity-80">
          <Avatar name={post.user.name} src={post.user.avatar_url} size="sm" />
          <span className="text-sm font-semibold text-slate-900">{post.user.name}</span>
        </Link>

        {isOwner && onDelete && (
          <button
            onClick={handleDelete}
            aria-label="Delete post"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-red-50 hover:text-red-600"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={handleMediaClick}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleOpen()}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        style={{ touchAction: 'pan-y' }}
        className={`group relative block aspect-square w-full select-none overflow-hidden bg-slate-100 ${
          hasMultipleImages ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        {hasImages ? (
          <div
            className="flex h-full"
            style={{
              transform: `translateX(calc(${-activeIndex * 100}% + ${dragOffset}px))`,
              transition: isDragging ? 'none' : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {images.map((img) => (
              <img
                key={img.id}
                src={img.url}
                alt=""
                loading="lazy"
                draggable={false}
                onDragStart={(e) => e.preventDefault()}
                className="h-full w-full flex-none object-cover"
              />
            ))}
          </div>
        ) : (
          <div className={`flex h-full items-center overflow-hidden bg-gradient-to-br p-8 ${textStyle}`}>
            <p className="line-clamp-[10] whitespace-pre-wrap text-lg font-medium leading-relaxed">
              {post.body}
            </p>
          </div>
        )}

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-150 group-hover:bg-black/10" />

        <span
          aria-hidden
          className="pointer-events-none absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 group-hover:opacity-100"
        >
          <ZoomIcon className="h-4 w-4" />
        </span>

        {hasMultipleImages && (
          <>
            <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white">
              <StackIcon className="h-3.5 w-3.5" />
              {activeIndex + 1}/{images.length}
            </div>

            <button
              onClick={goPrev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white hover:text-brand-600 group-hover:opacity-100"
            >
              <ChevronLeftIcon className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              aria-label="Next image"
              className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-600 opacity-0 shadow-sm backdrop-blur transition-opacity duration-150 hover:bg-white hover:text-brand-600 group-hover:opacity-100"
            >
              <ChevronRightIcon className="h-4 w-4" />
            </button>

            <div className="pointer-events-none absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1.5">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={(e) => goToImage(e, i)}
                  aria-label={`View image ${i + 1}`}
                  className={`pointer-events-auto h-1.5 rounded-full transition-all ${
                    i === activeIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/60 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center justify-between px-4 pt-3">
        <div className="flex items-center gap-4">
          {onToggleLike && (
            <button
              onClick={handleToggleLike}
              aria-label={post.is_liked ? 'Unlike post' : 'Like post'}
              className={`transition ${post.is_liked ? 'text-red-500' : 'text-slate-700 hover:text-red-500'}`}
            >
              <HeartIcon filled={post.is_liked} className="h-6 w-6" />
            </button>
          )}

          <button
            onClick={handleOpen}
            aria-label="View comments"
            className="text-slate-700 transition hover:text-brand-600"
          >
            <CommentIcon className="h-6 w-6" />
          </button>
        </div>

        {onToggleSave && (
          <button
            onClick={handleToggleSave}
            aria-label={post.is_saved ? 'Unsave post' : 'Save post'}
            className={`transition ${post.is_saved ? 'text-brand-600' : 'text-slate-700 hover:text-brand-600'}`}
          >
            <BookmarkIcon filled={post.is_saved} className="h-6 w-6" />
          </button>
        )}
      </div>

      <div className="px-4 pb-4 pt-2">
        {post.likes_count > 0 && (
          <p className="text-sm font-semibold text-slate-900">
            {post.likes_count} like{post.likes_count === 1 ? '' : 's'}
          </p>
        )}

        {hasImages && (
          <p className="line-clamp-2 whitespace-pre-wrap text-sm leading-snug text-slate-800">
            <Link to={`/users/${post.user.id}`} className="font-semibold text-slate-900 hover:underline">
              {post.user.name}
            </Link>{' '}
            {post.body}
          </p>
        )}

        {post.comments_count > 0 && (
          <button
            onClick={handleOpen}
            className="mt-1 block text-sm text-slate-400 transition hover:text-slate-600"
          >
            View all {post.comments_count} comment{post.comments_count === 1 ? '' : 's'}
          </button>
        )}

        <p className="mt-1.5 text-[0.7rem] uppercase tracking-wide text-slate-400">
          {formatRelativeTime(post.created_at)}
        </p>
      </div>
    </article>
  )
}
