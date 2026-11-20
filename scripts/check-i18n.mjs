import { readFileSync } from 'node:fs'

const locales = ['en', 'id', 'pt-BR']
const keys = locales.map((locale) =>
  Object.keys(JSON.parse(readFileSync(`src/messages/${locale}.json`, 'utf8')).app)
    .sort()
    .join(','),
)
if (keys.some((value) => value !== keys[0])) throw new Error('Translation key mismatch')
console.log('Translation parity: en, id, pt-BR')
