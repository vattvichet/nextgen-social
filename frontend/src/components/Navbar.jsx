import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { APP_NAME } from '../lib/appName'
import Avatar from './Avatar'
import { BookmarkIcon, CloseIcon, HomeIcon, LogoutIcon, MenuIcon, UserIcon, UsersIcon } from './icons'

function MobileMenuLink({ to, icon, label, onClick }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
    >
      {icon}
      {label}
    </Link>
  )
}

export default function Navbar() {
  const { user, loading, logout } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    function handleKeyDown(e) {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [menuOpen])

  function closeMenu() {
    setMenuOpen(false)
  }

  function handleMenuLogout() {
    closeMenu()
    logout()
  }

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-lg text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            {menuOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>

          <Link to="/" onClick={closeMenu} className="text-lg font-bold text-brand-600">
            {APP_NAME}
          </Link>
        </div>

        {!loading && (
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full transition hover:opacity-80 lg:flex"
              >
                <Avatar name={user.name} src={user.avatar_url} size="sm" />
                <span className="text-sm font-medium text-slate-600">{user.name}</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-brand-600 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        )}
      </div>

      {menuOpen && (
        <>
          <div className="fixed inset-0 z-10 bg-black/20 lg:hidden" onClick={closeMenu} />
          <div className="absolute inset-x-0 top-full z-20 border-b border-slate-200 bg-white p-3 shadow-lg lg:hidden">
            <nav className="space-y-1">
              <MobileMenuLink to="/" icon={<HomeIcon className="h-5 w-5" />} label="Home" onClick={closeMenu} />
              <MobileMenuLink to="/members" icon={<UsersIcon className="h-5 w-5" />} label="Members" onClick={closeMenu} />

              {user ? (
                <>
                  <MobileMenuLink to="/profile" icon={<UserIcon className="h-5 w-5" />} label="Profile" onClick={closeMenu} />
                  <MobileMenuLink to="/saved" icon={<BookmarkIcon className="h-5 w-5" />} label="Saved" onClick={closeMenu} />
                  <button
                    onClick={handleMenuLogout}
                    className="flex w-full items-center gap-3 rounded-xl border-t border-slate-100 px-3 py-2.5 pt-4 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                  >
                    <LogoutIcon className="h-5 w-5" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <MobileMenuLink to="/login" label="Log in" onClick={closeMenu} />
                  <MobileMenuLink to="/register" label="Sign up" onClick={closeMenu} />
                </>
              )}
            </nav>
          </div>
        </>
      )}
    </header>
  )
}
