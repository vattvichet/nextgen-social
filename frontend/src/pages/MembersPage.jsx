import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import { formatRelativeTime } from '../lib/format'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import Avatar from '../components/Avatar'
import { ArrowLeftIcon } from '../components/icons'

function MemberRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-3.5">
      <div className="h-10 w-10 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-32 rounded bg-slate-200" />
        <div className="h-2.5 w-20 rounded bg-slate-100" />
      </div>
      <div className="h-2.5 w-24 rounded bg-slate-100" />
    </div>
  )
}

export default function MembersPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    setLoading(true)
    setError('')
    client
      .get('/users')
      .then((res) => {
        const sorted = [...res.data.data].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at)
        )
        setUsers(sorted)
      })
      .catch(() => setError('Could not load members. Please try again.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <Navbar />

      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-brand-600">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to feed
        </Link>

        <h1 className="mt-4 text-xl font-bold text-slate-900">All Members</h1>
        <p className="mt-1 text-sm text-slate-500">
          {loading ? 'Loading members…' : `${users.length} registered member${users.length === 1 ? '' : 's'}`}
        </p>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          {loading ? (
            <div className="divide-y divide-slate-100">
              <MemberRowSkeleton />
              <MemberRowSkeleton />
              <MemberRowSkeleton />
              <MemberRowSkeleton />
              <MemberRowSkeleton />
            </div>
          ) : error ? (
            <div className="px-4 py-6 text-sm text-red-600">{error}</div>
          ) : users.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-slate-400">No members yet.</div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {users.map((u) => (
                <li key={u.id}>
                  <Link to={`/users/${u.id}`} className="flex items-center gap-3 px-4 py-3.5 transition hover:bg-slate-50">
                    <Avatar name={u.name} src={u.avatar_url} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {u.name}
                        {currentUser?.id === u.id && (
                          <span className="ml-2 text-[0.65rem] font-semibold uppercase tracking-wide text-brand-600">
                            You
                          </span>
                        )}
                      </p>
                      <p className="truncate text-xs text-slate-400">@{u.username}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-xs text-slate-500">Joined {formatRelativeTime(u.created_at)}</p>
                      <p className="text-[0.7rem] text-slate-400">
                        {u.posts_count} post{u.posts_count === 1 ? '' : 's'}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
