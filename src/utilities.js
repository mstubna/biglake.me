import axios from 'axios'
import stringSimilarity from 'string-similarity'
import { first, last } from 'lodash'
import { waterBodies } from './water_bodies.json'

const API = 'https://api.biglake.me/biglakedataquery'

const ignored = [
  'creek',
  'river',
  'lake',
  'reservoir',
  'millpond',
  'pond',
  'bayou',
  'prong',
  'rio',
  'fork',
  'branch',
  'north',
  'south',
  'east',
  'west',
  'little',
  'big',
  'long',
  'short',
]
const ignoredRegex = new RegExp(ignored.join('|'), 'ig')
const keywords = waterBodies
  .map((wb) => wb.name.toLowerCase())
  .map((r) => {
    return r
      .split(/\s+/)
      .filter((sub) => !ignoredRegex.test(sub))
      .join('')
  })

const findBestMatchForStr = (str) => {
  const { bestMatch } = stringSimilarity.findBestMatch(str, keywords)
  const matches = keywords
    .map((keyword, i) => ({ keyword, i }))
    .filter(({ keyword }) => keyword === bestMatch.target)
    .map(({ i }) => waterBodies[i])
    .sort((a, b) => b.sqkm - a.sqkm)

  console.log(`Best match for ${str} is`, matches[0], bestMatch.rating)
  return { match: matches[0], rating: bestMatch.rating }
}

const findBestMatchForName = (name) => {
  const names = name.trim().toLowerCase().split(/\s+/)
  const fullNameMatch = findBestMatchForStr(names.join(''))
  const lastNameMatch = findBestMatchForStr(last(names))
  const firstNameMatch = findBestMatchForStr(first(names))
  if (fullNameMatch.rating > 0.75) {
    return fullNameMatch.match
  }
  if (lastNameMatch.rating > 0.67) {
    return lastNameMatch.match
  }
  return firstNameMatch.rating > lastNameMatch.rating
    ? firstNameMatch.match
    : lastNameMatch.match
}

const getGeo = async (id) => {
  return axios.get(API, { params: { id } })
}

export { findBestMatchForName, getGeo }
