import { useEffect, useState } from 'react'

const DISPLAY_MS = 2200
const TRANSITION_MS = 200

export default function Toast({ toast, onDone }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!toast) return
    const raf = requestAnimationFrame(() => setVisible(true))
    const hideTimer = setTimeout(() => setVisible(false), DISPLAY_MS)
    const doneTimer = setTimeout(onDone, DISPLAY_MS + TRANSITION_MS)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(hideTimer)
      clearTimeout(doneTimer)
    }
  }, [toast, onDone])

  if (!toast) return null

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-6 z-[60] flex justify-center px-4">
      <div
        className={`pointer-events-auto rounded-full bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg transition-all ease-out ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      >
        {toast.message}
      </div>
    </div>
  )
}
