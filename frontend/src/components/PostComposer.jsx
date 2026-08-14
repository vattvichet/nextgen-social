import { useRef, useState } from 'react'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/errors'
import Avatar from './Avatar'
import { CloseIcon, ImageIcon } from './icons'

const MAX_IMAGES = 5

export default function PostComposer({ onPostCreated }) {
  const { user } = useAuth()
  const [body, setBody] = useState('')
  const [images, setImages] = useState([])
  const [imageNotice, setImageNotice] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  function handleImageChange(e) {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setImages((prev) => {
      const remaining = MAX_IMAGES - prev.length
      const accepted = files.slice(0, remaining)
      const rejectedCount = files.length - accepted.length

      setImageNotice(
        rejectedCount > 0
          ? `You can add up to ${MAX_IMAGES} photos per post. ${rejectedCount} file${rejectedCount === 1 ? ' was' : 's were'} not added.`
          : ''
      )

      const newEntries = accepted.map((file) => ({ file, preview: URL.createObjectURL(file) }))
      return [...prev, ...newEntries]
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function removeImage(index) {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview)
      return prev.filter((_, i) => i !== index)
    })
    setImageNotice('')
  }

  function resetComposer() {
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setBody('')
    setImages([])
    setImageNotice('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!body.trim()) return

    setError('')
    setSubmitting(true)

    const formData = new FormData()
    formData.append('body', body)
    images.forEach(({ file }) => formData.append('images[]', file))

    try {
      const res = await client.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onPostCreated(res.data.data)
      resetComposer()
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not create post. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-shadow duration-200 focus-within:shadow-md sm:p-5"
    >
      <div className="flex gap-3">
        <Avatar name={user?.name} src={user?.avatar_url} />
        <div className="flex-1">
          <textarea
            id="post-composer"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What's on your mind?"
            rows={3}
            maxLength={5000}
            className="w-full resize-none rounded-lg border-0 px-1 py-1 text-[0.925rem] placeholder:text-slate-400 focus:outline-none focus:ring-0"
          />

          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img.preview}
                    alt="Preview"
                    className="h-24 w-24 rounded-xl border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {imageNotice && <p className="mt-2 text-xs text-amber-600">{imageNotice}</p>}
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
            <label
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                images.length >= MAX_IMAGES
                  ? 'cursor-not-allowed text-slate-300'
                  : 'cursor-pointer text-slate-500 hover:bg-brand-50 hover:text-brand-600'
              }`}
            >
              <ImageIcon className="h-[18px] w-[18px]" />
              <span>{images.length > 0 ? `${images.length}/${MAX_IMAGES} photos` : 'Photo'}</span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                disabled={images.length >= MAX_IMAGES}
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            <button
              type="submit"
              disabled={!body.trim() || submitting}
              className="rounded-full bg-brand-600 px-5 py-1.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
            >
              {submitting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
