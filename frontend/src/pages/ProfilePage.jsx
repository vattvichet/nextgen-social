import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../lib/errors'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import { ArrowLeftIcon, ImageIcon, InboxIcon } from '../components/icons'

const SKELETON_HEIGHTS = [220, 300, 170, 260]

function PostCardSkeleton({ height }) {
  return (
    <div
      style={{ height }}
      className="mb-4 animate-pulse break-inside-avoid rounded-2xl bg-slate-200/70"
    />
  )
}

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth()
  const [bio, setBio] = useState(user?.bio || '')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInputRef = useRef(null)

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  })
  const [passwordErrors, setPasswordErrors] = useState({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')

  useEffect(() => {
    if (!user) return
    setPostsLoading(true)
    setPostsError('')
    client
      .get('/posts', { params: { user_id: user.id } })
      .then((res) => setPosts(res.data.data))
      .catch(() => setPostsError('Could not load your posts.'))
      .finally(() => setPostsLoading(false))
  }, [user])

  function handleAvatarChange(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setSubmitting(true)

    const formData = new FormData()
    formData.append('bio', bio)
    if (avatarFile) formData.append('avatar', avatarFile)

    try {
      const res = await client.post('/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      updateUser(res.data.data)
      setAvatarFile(null)
      setAvatarPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      setSuccess(true)
    } catch (err) {
      setError(extractErrorMessage(err, 'Could not update your profile. Please try again.'))
    } finally {
      setSubmitting(false)
    }
  }

  async function handlePasswordSubmit(e) {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess(false)
    setPasswordSubmitting(true)

    try {
      await client.post('/profile/password', passwordForm)
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' })
      setPasswordSuccess(true)
    } catch (err) {
      if (err.response?.data?.errors) {
        setPasswordErrors(err.response.data.errors)
      } else {
        setPasswordErrors({ general: 'Could not update your password. Please try again.' })
      }
    } finally {
      setPasswordSubmitting(false)
    }
  }

  async function handleDeletePost(postId) {
    if (!window.confirm('Delete this post?')) return
    try {
      await client.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {
      setPostsError('Could not delete the post.')
    }
  }

  if (!user) return null

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to feed
          </Link>

          <h1 className="mt-4 text-xl font-bold text-slate-900">Your Profile</h1>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center gap-5">
              <div className="relative">
                <Avatar name={user.name} src={avatarPreview || user.avatar_url} size="xl" />
                <label className="absolute -bottom-1 -right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700">
                  <ImageIcon className="h-4 w-4" />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <p className="text-base font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-400">@{user.username}</p>
                <p className="mt-1 text-xs text-slate-400">{user.email}</p>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                placeholder="Tell people a little about yourself…"
                className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              <p className="mt-1 text-right text-xs text-slate-400">{bio.length}/500</p>
            </div>

            {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}
            {success && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                Profile updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="mt-6 space-y-4 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate-900">Change Password</h2>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Current password</label>
              <input
                type="password"
                required
                placeholder="Enter your current password"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              {passwordErrors.current_password && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.current_password[0]}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                required
                placeholder="At least 8 characters"
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
              {passwordErrors.password && (
                <p className="mt-1 text-xs text-red-600">{passwordErrors.password[0]}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                type="password"
                required
                placeholder="Re-enter your new password"
                value={passwordForm.password_confirmation}
                onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>

            {passwordErrors.general && (
              <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{passwordErrors.general}</div>
            )}
            {passwordSuccess && (
              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
                Password updated successfully.
              </div>
            )}

            <button
              type="submit"
              disabled={passwordSubmitting}
              className="rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {passwordSubmitting ? 'Updating…' : 'Update password'}
            </button>
          </form>
        </div>

        <div className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Your Posts</h2>
          <p className="mt-1 text-sm text-slate-500">
            {postsLoading ? 'Loading…' : `${posts.length} post${posts.length === 1 ? '' : 's'}`}
          </p>

          <div className="mt-4">
            {postsLoading ? (
              <div className="columns-2 gap-4 sm:columns-3">
                {SKELETON_HEIGHTS.map((height, i) => (
                  <PostCardSkeleton key={i} height={height} />
                ))}
              </div>
            ) : postsError ? (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{postsError}</div>
            ) : posts.length === 0 ? (
              <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-12 text-center">
                <InboxIcon className="h-8 w-8 text-slate-300" />
                <p className="mt-3 text-sm text-slate-500">You haven&apos;t posted anything yet.</p>
              </div>
            ) : (
              <div className="columns-2 gap-4 sm:columns-3">
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} onDelete={handleDeletePost} />
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-2xl">
          <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
            <button
              onClick={logout}
              className="w-full rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              Log out
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
