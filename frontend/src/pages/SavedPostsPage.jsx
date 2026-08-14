import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
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

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    client
      .get('/saved-posts')
      .then((res) => setPosts(res.data.data))
      .catch(() => setError('Could not load your saved posts.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to feed
        </Link>

        <h1 className="mt-4 text-xl font-bold text-slate-900">Saved Posts</h1>

        <div className="mt-6">
          {loading ? (
            <div className="columns-2 gap-4 sm:columns-3">
              {SKELETON_HEIGHTS.map((height, i) => (
                <PostCardSkeleton key={i} height={height} />
              ))}
            </div>
          ) : error ? (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          ) : posts.length === 0 ? (
            <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
              <InboxIcon className="h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm text-slate-500">No saved posts yet.</p>
            </div>
          ) : (
            <div className="columns-2 gap-4 sm:columns-3">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
