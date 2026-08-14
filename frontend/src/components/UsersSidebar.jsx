import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import client from '../api/client'
import { useAuth } from '../context/AuthContext'
import Avatar from './Avatar'

function UserRowSkeleton() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-2 py-2">
      <div className="h-9 w-9 rounded-full bg-slate-200" />
      <div className="flex-1 space-y-1.5">
        <div className="h-2.5 w-24 rounded bg-slate-200" />
        <div className="h-2 w-16 rounded bg-slate-100" />
      </div>
    </div>
  )
}

export default function UsersSidebar() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    client
      .get('/users')
      .then((res) => setUsers(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <aside className="hidden lg:block lg:w-72 lg:shrink-0">
      <div className="sticky top-20 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm">
        <h2 className="mb-2 px-2 text-sm font-semibold text-slate-900">Members</h2>

        {loading ? (
          <div className="space-y-1">
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
            <UserRowSkeleton />
          </div>
        ) : users.length === 0 ? (
          <p className="px-2 py-2 text-sm text-slate-400">No members yet.</p>
        ) : (
          <ul className="max-h-[60vh] space-y-0.5 overflow-y-auto">
            {users.map((u) => (
              <li key={u.id}>
                <Link
                  to={`/users/${u.id}`}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 transition hover:bg-slate-50"
                >
                  <Avatar name={u.name} src={u.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="truncate text-xs text-slate-400">@{u.username}</p>
                  </div>
                  {currentUser?.id === u.id ? (
                    <span className="text-[0.65rem] font-semibold uppercase tracking-wide text-brand-600">You</span>
                  ) : (
                    <span className="text-[0.7rem] text-slate-400">
                      {u.posts_count} post{u.posts_count === 1 ? '' : 's'}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}

        {!loading && users.length > 0 && (
          <Link
            to="/members"
            className="mt-2 block rounded-lg px-2 py-2 text-center text-sm font-medium text-brand-600 transition hover:bg-brand-50"
          >
            See all
          </Link>
        )}

        {!currentUser && (
          <Link
            to="/register"
            className="mt-2 block rounded-full bg-brand-600 px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Sign up to join
          </Link>
        )}
      </div>
    </aside>
  )
}
