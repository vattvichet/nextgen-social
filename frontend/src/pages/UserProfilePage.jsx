import { useEffect, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/format'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import PostCard from '../components/PostCard'
import { ArrowLeftIcon, InboxIcon } from '../components/icons'

const SKELETON_HEIGHTS = [220, 300, 170, 260]

function PostCardSkeleton({ height }) {
  return (
    <div
      style={{ height }}
      className="mb-4 animate-pulse break-inside-avoid rounded-2xl bg-slate-200/70"
    />
  )
}

export default function UserProfilePage() {
  const { id } = useParams()
  const { user: currentUser } = useAuth()
  const [profileUser, setProfileUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [posts, setPosts] = useState([])
  const [postsLoading, setPostsLoading] = useState(true)
  const [postsError, setPostsError] = useState('')

  const isSelf = currentUser && String(currentUser.id) === id

  useEffect(() => {
    if (isSelf) return
    setLoading(true)
    setError('')
    client
      .get(`/users/${id}`)
      .then((res) => setProfileUser(res.data.data))
      .catch(() => setError('This user could not be found.'))
      .finally(() => setLoading(false))
  }, [id, isSelf])

  useEffect(() => {
    if (isSelf || !profileUser) return
    setPostsLoading(true)
    setPostsError('')
    client
      .get('/posts', { params: { user_id: profileUser.id } })
      .then((res) => setPosts(res.data.data))
      .catch(() => setPostsError('Could not load their posts.'))
      .finally(() => setPostsLoading(false))
  }, [isSelf, profileUser])

  if (isSelf) {
    return <Navigate to="/profile" replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to feed
          </Link>

          {loading ? (
            <div className="mt-6 flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
            </div>
          ) : error || !profileUser ? (
            <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : (
            <div className="mt-6 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <Avatar name={profileUser.name} src={profileUser.avatar_url} size="xl" />
                <div>
                  <p className="text-base font-semibold text-slate-900">{profileUser.name}</p>
                  <p className="text-sm text-slate-400">@{profileUser.username}</p>
                  <p className="mt-1 text-xs text-slate-400">Joined {formatRelativeTime(profileUser.created_at)}</p>
                </div>
              </div>

              {profileUser.bio && (
                <p className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{profileUser.bio}</p>
              )}

              <p className="mt-5 text-xs text-slate-400">
                {profileUser.posts_count} post{profileUser.posts_count === 1 ? '' : 's'}
              </p>
            </div>
          )}
        </div>

        {!loading && profileUser && (
          <div className="mt-10">
            <h2 className="text-lg font-bold text-slate-900">Posts</h2>
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
                  <p className="mt-3 text-sm text-slate-500">No posts yet.</p>
                </div>
              ) : (
                <div className="columns-2 gap-4 sm:columns-3">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
