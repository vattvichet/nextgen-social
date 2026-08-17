import { useEffect, useState } from 'react'
import client from '../api/client'
import { extractErrorMessage } from '../lib/errors'
import { ShieldIcon } from './icons'

const inputClass =
  'w-full rounded-lg border border-slate-300 px-3 py-2 text-sm placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100'
const primaryBtnClass =
  'rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60'
const secondaryBtnClass =
  'rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60'
const destructiveBtnClass =
  'rounded-full border border-red-200 px-5 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60'

function RecoveryCodesReveal({ codes, onDone }) {
  const [ack, setAck] = useState(false)

  function copyAll() {
    navigator.clipboard?.writeText(codes.join('\n'))
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-600">
        Save these recovery codes somewhere safe. Each can be used once to sign in if you lose access to your
        authenticator app. They won&apos;t be shown again.
      </div>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-4 font-mono text-sm text-slate-700">
        {codes.map((code) => (
          <span key={code}>{code}</span>
        ))}
      </div>

      <button type="button" onClick={copyAll} className={secondaryBtnClass}>
        Copy all codes
      </button>

      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} />
        I&apos;ve saved my recovery codes
      </label>

      <button type="button" disabled={!ack} onClick={onDone} className={primaryBtnClass}>
        Done
      </button>
    </div>
  )
}

export default function TwoFactorSettings() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [mode, setMode] = useState('idle') // idle | setup | regenerate | disable

  const [setupData, setSetupData] = useState(null)
  const [setupCode, setSetupCode] = useState('')
  const [setupSubmitting, setSetupSubmitting] = useState(false)
  const [setupError, setSetupError] = useState('')

  const [newRecoveryCodes, setNewRecoveryCodes] = useState(null)

  const [recoveryList, setRecoveryList] = useState(null)
  const [recoveryListLoading, setRecoveryListLoading] = useState(false)
  const [showRecoveryList, setShowRecoveryList] = useState(false)

  const [actionCode, setActionCode] = useState('')
  const [actionSubmitting, setActionSubmitting] = useState(false)
  const [actionError, setActionError] = useState('')

  useEffect(() => {
    client
      .get('/2fa/status')
      .then((res) => setStatus(res.data))
      .catch(() => setError('Could not load your two-factor authentication status.'))
      .finally(() => setLoading(false))
  }, [])

  function resetActionState() {
    setMode('idle')
    setActionCode('')
    setActionError('')
  }

  async function handleEnableClick() {
    setSetupError('')
    setMode('setup')
    try {
      const res = await client.post('/2fa/setup')
      if (res.data.status === 'already_enabled') {
        setMode('idle')
        setStatus((prev) => ({ ...prev, two_factor_enabled: true }))
      } else {
        setSetupData(res.data)
      }
    } catch (err) {
      setSetupError(extractErrorMessage(err, 'Could not start setup. Please try again.'))
    }
  }

  async function handleVerifySetup(e) {
    e.preventDefault()
    setSetupSubmitting(true)
    setSetupError('')
    try {
      const res = await client.post('/2fa/verify-setup', { otp_code: setupCode })
      setNewRecoveryCodes(res.data.recovery_codes)
      setStatus({ two_factor_enabled: true, recovery_codes_remaining: res.data.recovery_codes_count })
    } catch (err) {
      setSetupError(extractErrorMessage(err, 'That code is incorrect. Please try again.'))
    } finally {
      setSetupSubmitting(false)
    }
  }

  function finishSetup() {
    setMode('idle')
    setSetupData(null)
    setSetupCode('')
    setNewRecoveryCodes(null)
  }

  async function toggleRecoveryList() {
    if (showRecoveryList) {
      setShowRecoveryList(false)
      return
    }
    setRecoveryListLoading(true)
    setError('')
    try {
      const res = await client.get('/2fa/recovery-codes')
      setRecoveryList(res.data)
      setShowRecoveryList(true)
    } catch {
      setError('Could not load your recovery codes.')
    } finally {
      setRecoveryListLoading(false)
    }
  }

  async function handleRegenerate(e) {
    e.preventDefault()
    setActionSubmitting(true)
    setActionError('')
    try {
      const res = await client.post('/2fa/recovery-codes/regenerate', { otp_code: actionCode })
      setNewRecoveryCodes(res.data.recovery_codes)
      setStatus((prev) => ({ ...prev, recovery_codes_remaining: res.data.recovery_codes_count }))
      setShowRecoveryList(false)
      resetActionState()
    } catch (err) {
      setActionError(extractErrorMessage(err, 'That code is incorrect.'))
    } finally {
      setActionSubmitting(false)
    }
  }

  async function handleDisable(e) {
    e.preventDefault()
    setActionSubmitting(true)
    setActionError('')
    try {
      await client.delete('/2fa/disable', { data: { otp_code: actionCode } })
      setStatus({ two_factor_enabled: false })
      setShowRecoveryList(false)
      resetActionState()
    } catch (err) {
      setActionError(extractErrorMessage(err, 'That code is incorrect.'))
    } finally {
      setActionSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <ShieldIcon className="h-5 w-5 text-slate-700" filled={status?.two_factor_enabled} />
        <h2 className="text-base font-semibold text-slate-900">Two-Factor Authentication</h2>
      </div>

      {loading ? (
        <p className="mt-3 text-sm text-slate-500">Loading…</p>
      ) : error && !status ? (
        <div className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>
      ) : newRecoveryCodes ? (
        <div className="mt-4">
          <RecoveryCodesReveal codes={newRecoveryCodes} onDone={finishSetup} />
        </div>
      ) : mode === 'setup' ? (
        <div className="mt-4 space-y-4">
          {setupError && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{setupError}</div>}

          {setupData ? (
            <>
              <p className="text-sm text-slate-600">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.), or enter the
                code manually.
              </p>
              <div
                className="w-fit rounded-lg border border-slate-200 p-3"
                dangerouslySetInnerHTML={{ __html: setupData.qr_code_svg }}
              />
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Manual entry code</p>
                <p className="break-all rounded-lg bg-slate-50 px-3 py-2 font-mono text-sm text-slate-700">
                  {setupData.otp_secret}
                </p>
              </div>

              <form onSubmit={handleVerifySetup} className="space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-medium text-slate-700">
                    Enter the 6-digit code from your app
                  </label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="123456"
                    value={setupCode}
                    onChange={(e) => setSetupCode(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={setupSubmitting} className={primaryBtnClass}>
                    {setupSubmitting ? 'Activating…' : 'Activate'}
                  </button>
                  <button type="button" onClick={finishSetup} className={secondaryBtnClass}>
                    Cancel
                  </button>
                </div>
              </form>
            </>
          ) : (
            <p className="text-sm text-slate-500">Loading setup…</p>
          )}
        </div>
      ) : status?.two_factor_enabled ? (
        <div className="mt-4 space-y-4">
          <div className="flex items-center gap-1.5 text-sm text-emerald-600">
            <ShieldIcon filled className="h-4 w-4" />
            Enabled
          </div>
          <p className="text-sm text-slate-500">
            {status.recovery_codes_remaining} recovery code{status.recovery_codes_remaining === 1 ? '' : 's'}{' '}
            remaining.
          </p>

          {error && <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</div>}

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={toggleRecoveryList} disabled={recoveryListLoading} className={secondaryBtnClass}>
              {recoveryListLoading ? 'Loading…' : showRecoveryList ? 'Hide recovery codes' : 'View recovery codes'}
            </button>
            {mode !== 'regenerate' && (
              <button type="button" onClick={() => setMode('regenerate')} className={secondaryBtnClass}>
                Regenerate codes
              </button>
            )}
            {mode !== 'disable' && (
              <button type="button" onClick={() => setMode('disable')} className={destructiveBtnClass}>
                Disable 2FA
              </button>
            )}
          </div>

          {showRecoveryList && recoveryList && (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
              {recoveryList.codes.map((c) => (
                <li key={c.masked_code} className="flex items-center justify-between px-3 py-2 text-sm">
                  <span className={`font-mono ${c.used ? 'text-slate-300 line-through' : 'text-slate-700'}`}>
                    {c.masked_code}
                  </span>
                  {c.used && <span className="text-xs text-slate-400">Used</span>}
                </li>
              ))}
            </ul>
          )}

          {mode === 'regenerate' && (
            <form onSubmit={handleRegenerate} className="space-y-3 rounded-lg bg-slate-50 p-4">
              <p className="text-sm text-slate-600">
                Enter your current authenticator code to regenerate your recovery codes. Your old codes will stop
                working.
              </p>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
              <input
                type="text"
                required
                autoFocus
                placeholder="123456"
                value={actionCode}
                onChange={(e) => setActionCode(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={actionSubmitting} className={primaryBtnClass}>
                  {actionSubmitting ? 'Regenerating…' : 'Regenerate'}
                </button>
                <button type="button" onClick={resetActionState} className={secondaryBtnClass}>
                  Cancel
                </button>
              </div>
            </form>
          )}

          {mode === 'disable' && (
            <form onSubmit={handleDisable} className="space-y-3 rounded-lg bg-red-50 p-4">
              <p className="text-sm text-red-700">
                Enter your current authenticator code to turn off two-factor authentication.
              </p>
              {actionError && <p className="text-sm text-red-600">{actionError}</p>}
              <input
                type="text"
                required
                autoFocus
                placeholder="123456"
                value={actionCode}
                onChange={(e) => setActionCode(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                <button type="submit" disabled={actionSubmitting} className={destructiveBtnClass}>
                  {actionSubmitting ? 'Disabling…' : 'Disable 2FA'}
                </button>
                <button type="button" onClick={resetActionState} className={secondaryBtnClass}>
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-slate-500">
            Add an extra layer of security to your account by requiring a code from your authenticator app when you
            sign in.
          </p>
          <button type="button" onClick={handleEnableClick} className={primaryBtnClass}>
            Enable two-factor authentication
          </button>
        </div>
      )}
    </div>
  )
}
