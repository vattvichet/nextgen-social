import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { createKeyedDebouncer } from '../lib/debounce'
import { extractErrorMessage } from '../lib/errors'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import PostComposer from '../components/PostComposer'
import FeedPostCard from '../components/FeedPostCard'
import PostModal from '../components/PostModal'
import LeftNavRail from '../components/LeftNavRail'
import UsersSidebar from '../components/UsersSidebar'
import { CheckCircleIcon, InboxIcon } from '../components/icons'

function PostCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-slate-200/60 bg-white">
      <div className="flex items-center gap-2.5 px-4 py-3">
        <div className="h-8 w-8 rounded-full bg-slate-200" />
        <div className="h-3 w-24 rounded bg-slate-200" />
      </div>
      <div className="aspect-square w-full bg-slate-200" />
      <div className="space-y-2 px-4 py-4">
        <div className="h-3 w-3/4 rounded bg-slate-200" />
        <div className="h-3 w-1/2 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function FeedPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [posts, setPosts] = useState([])
  const [page, setPage] = useState(1)
  const [lastPage, setLastPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [openPostId, setOpenPostId] = useState(null)

  const sentinelRef = useRef(null)
  const isFetchingMoreRef = useRef(false)
  const debounceLike = useRef(createKeyedDebouncer(400)).current

  const loadPage = useCallback(async (pageNum) => {
    const res = await client.get('/posts', { params: { page: pageNum } })
    return res.data
  }, [])

  useEffect(() => {
    setLoading(true)
    setError('')
    loadPage(1)
      .then((data) => {
        setPosts(data.data)
        setPage(data.meta.current_page)
        setLastPage(data.meta.last_page)
      })
      .catch(() => setError('Could not load the feed. Please try again.'))
      .finally(() => setLoading(false))
  }, [loadPage])

  const handleLoadMore = useCallback(async () => {
    if (isFetchingMoreRef.current) return
    isFetchingMoreRef.current = true
    setLoadingMore(true)
    try {
      const data = await loadPage(page + 1)
      setPosts((prev) => [...prev, ...data.data])
      setPage(data.meta.current_page)
      setLastPage(data.meta.last_page)
    } catch {
      setError('Could not load more posts.')
    } finally {
      setLoadingMore(false)
      isFetchingMoreRef.current = false
    }
  }, [loadPage, page])

  useEffect(() => {
    if (loading || page >= lastPage) return
    const node = sentinelRef.current
    if (!node) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) handleLoadMore()
      },
      { rootMargin: '600px' }
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [loading, page, lastPage, handleLoadMore])

  function handlePostCreated(post) {
    setPosts((prev) => [post, ...prev])
  }

  async function handleDelete(postId) {
    if (!window.confirm('Delete this post?')) return
    try {
      await client.delete(`/posts/${postId}`)
      setPosts((prev) => prev.filter((p) => p.id !== postId))
    } catch {
      setError('Could not delete the post.')
    }
  }

  function handlePostRemoved(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId))
  }

  function handlePostChange(updatedPost) {
    setPosts((prev) => prev.map((p) => (p.id === updatedPost.id ? updatedPost : p)))
  }

  async function handleToggleSave(postId, nextSaved) {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_saved: nextSaved } : p)))
    try {
      if (nextSaved) {
        await client.post(`/posts/${postId}/save`)
        showToast('Post saved')
      } else {
        await client.delete(`/posts/${postId}/save`)
        showToast('Removed from saved')
      }
    } catch {
      setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, is_saved: !nextSaved } : p)))
      showToast('Could not update saved status')
    }
  }

  function handleToggleLike(postId, nextLiked) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, is_liked: nextLiked, likes_count: (p.likes_count ?? 0) + (nextLiked ? 1 : -1) }
          : p
      )
    )

    debounceLike(postId, async () => {
      try {
        if (nextLiked) {
          await client.post(`/posts/${postId}/like`)
        } else {
          await client.delete(`/posts/${postId}/like`)
        }
      } catch (err) {
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, is_liked: !nextLiked, likes_count: (p.likes_count ?? 0) + (nextLiked ? -1 : 1) }
              : p
          )
        )
        if (err.response?.status === 429) {
          showToast(extractErrorMessage(err, "You're liking too fast. Please slow down."))
        }
      }
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        <div className="flex gap-6">
          <LeftNavRail />

          <div className="flex min-w-0 flex-1 justify-center">
            <div className="w-full max-w-[470px]">
              <div className="mb-6">
                {user ? (
                  <PostComposer onPostCreated={handlePostCreated} />
                ) : (
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
                    <p className="text-sm text-slate-600">Log in to share posts, photos, and comments.</p>
                    <Link
                      to="/login"
                      className="shrink-0 rounded-full bg-brand-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      Log in
                    </Link>
                  </div>
                )}
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {loading ? (
                <div className="space-y-6">
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                  <PostCardSkeleton />
                </div>
              ) : posts.length === 0 ? (
                <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
                  <InboxIcon className="h-9 w-9 text-slate-300" />
                  <p className="mt-3 text-sm text-slate-500">No posts yet. Be the first to share something!</p>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    {posts.map((post) => (
                      <FeedPostCard
                        key={post.id}
                        post={post}
                        onDelete={user ? handleDelete : undefined}
                        onOpenPost={setOpenPostId}
                        onToggleSave={user ? handleToggleSave : undefined}
                        onToggleLike={user ? handleToggleLike : undefined}
                      />
                    ))}
                  </div>

                  {page < lastPage ? (
                    <div ref={sentinelRef} className="flex justify-center py-6">
                      {loadingMore && (
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-1.5 py-8 text-sm text-slate-400">
                      <CheckCircleIcon className="h-4 w-4" />
                      You&apos;re all caught up
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <UsersSidebar />
        </div>
      </main>

      <Footer />

      {openPostId && (
        <PostModal
          postId={openPostId}
          onClose={() => setOpenPostId(null)}
          onPostChange={handlePostChange}
          onDeleted={handlePostRemoved}
        />
      )}
    </div>
  )
}
