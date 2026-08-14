const TEXT_PIN_STYLES = [
  'from-rose-50 to-rose-100 text-rose-900',
  'from-amber-50 to-amber-100 text-amber-900',
  'from-emerald-50 to-emerald-100 text-emerald-900',
  'from-sky-50 to-sky-100 text-sky-900',
  'from-violet-50 to-violet-100 text-violet-900',
  'from-brand-50 to-brand-100 text-brand-900',
]

export function getTextPinStyle(postId) {
  return TEXT_PIN_STYLES[postId % TEXT_PIN_STYLES.length]
}
