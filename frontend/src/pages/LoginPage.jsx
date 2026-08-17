import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import AuthLayout from '../components/AuthLayout'

export default function LoginPage() {
  const { login, verifyLoginOtp, verifyLoginRecovery } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ login: '', password: '' })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  const [step, setStep] = useState('password')
  const [pendingToken, setPendingToken] = useState(null)
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [code, setCode] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      const result = await login(form)
      if (result.twoFactorRequired) {
        setPendingToken(result.pendingToken)
        setStep('otp')
      } else {
        navigate('/')
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setErrors({ general: 'Incorrect email/username or password.' })
      } else if (err.response?.data?.errors) {
        setErrors(err.response.data.errors)
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  async function handleOtpSubmit(e) {
    e.preventDefault()
    setErrors({})
    setSubmitting(true)
    try {
      if (useRecoveryCode) {
        await verifyLoginRecovery(pendingToken, code)
      } else {
        await verifyLoginOtp(pendingToken, code)
      }
      navigate('/')
    } catch (err) {
      if (err.response?.status === 422) {
        setErrors({ general: err.response.data?.message || 'That code is incorrect or expired.' })
      } else if (err.response?.status === 401) {
        setErrors({ general: 'Your session has expired. Please log in again.' })
        setStep('password')
        setPendingToken(null)
      } else {
        setErrors({ general: 'Something went wrong. Please try again.' })
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (step === 'otp') {
    return (
      <AuthLayout
        title="Verify It's You"
        subtitle={
          useRecoveryCode
            ? 'Enter one of your recovery codes.'
            : 'Enter the 6-digit code from your authenticator app.'
        }
      >
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          {errors.general && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.general}</div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {useRecoveryCode ? 'Recovery code' : 'Authentication code'}
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={useRecoveryCode ? 'ABCD-EFGH-IJKL-MNOP' : '123456'}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? 'Verifying…' : 'Verify'}
          </button>

          <button
            type="button"
            onClick={() => {
              setUseRecoveryCode((v) => !v)
              setCode('')
              setErrors({})
            }}
            className="w-full text-center text-sm text-slate-500 hover:text-brand-600"
          >
            {useRecoveryCode ? 'Use an authenticator code instead' : "Can't access your authenticator app?"}
          </button>
        </form>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Welcome Back" subtitle="Good to see you again. Sign in to catch up on your feed.">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{errors.general}</div>
        )}

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email or username</label>
          <input
            type="text"
            required
            placeholder="you@example.com"
            value={form.login}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.login && <p className="mt-1 text-xs text-red-600">{errors.login[0]}</p>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input
            type="password"
            required
            placeholder="Enter your password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
          />
          {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password[0]}</p>}
        </div>

        <p className="text-right text-xs">
          <Link to="/forgot-password" className="text-slate-500 hover:text-brand-600">
            Forgot password?
          </Link>
        </p>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-lg bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
