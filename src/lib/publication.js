export function isPublicContent({ status = 'published', date }, now = new Date()) {
  if (status === 'published') return true
  if (status !== 'scheduled' || !date) return false
  return new Date(date).getTime() <= now.getTime()
}
