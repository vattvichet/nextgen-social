import { useCallback, useEffect, useState } from 'react'
import PostDetailCard from './PostDetailCard'
import { CloseIcon } from './icons'

const TRANSITION_MS = 220

export default function PostModal({ postId, onClose, onPostChange, onDeleted }) {
  const [visible, setVisible] = useState(false)

  const handleClose = useCallback(() => {
    setVisible(false)
    setTimeout(onClose, TRANSITION_MS)
  }, [onClose])

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(raf)
  }, [])

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleClose])

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4 transition-opacity ease-out ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      onClick={handleClose}
    >
      <div
        className={`relative my-auto w-full max-w-5xl transition-all ease-out ${
          visible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          aria-label="Close"
          className="absolute -right-2 -top-2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-md transition hover:text-brand-600 sm:-right-4 sm:-top-4"
        >
          <CloseIcon className="h-4 w-4" />
        </button>

        <PostDetailCard postId={postId} onBack={handleClose} onPostChange={onPostChange} onDeleted={onDeleted} />
      </div>
    </div>
  )
}
