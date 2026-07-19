/** Author profiles are managed from umyz-admin. */
import authorProfiles from './authors.json'

export const authors = authorProfiles

export function getAuthor(name) {
  return authors[name] || null
}

export function getAuthors(names) {
  if (!Array.isArray(names)) return []
  return names.map(getAuthor).filter(Boolean)
}
