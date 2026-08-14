import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import client from '../api/client'
import AuthLayout from '../components/AuthLayout'

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token') || ''
  const email = searchParams.get('email') || ''

  const [form, setForm] = useState({ password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      await client.post('/reset-password', { ...form, token, email })
      navigate('/login')
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: err.response?.data?.message || 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token || !email) {
    return (
      <AuthLayout title="Reset Password" subtitle="This password reset link is missing required information.">
        <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          This link looks broken. Please request a new password reset link.
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          <Link to="/forgot-password" className="font-semibold text-brand-600 hover:text-brand-700">
            Request a new link
          </Link>
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset Password" subtitle={`Choose a new password for ${email}.`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.general}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
          <input
            type="password"
            required
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm password</label>
          <input
            type="password"
            required
            placeholder="Re-enter your new password"
            value={form.password_confirmation}
            onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Resetting…' : 'Reset password'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
