import { readFileSync } from 'node:fs'

const locales = ['en', 'id']

function paths(value, prefix = '') {
  return Object.entries(value)
    .flatMap(([key, child]) => {
      const path = prefix ? `${prefix}.${key}` : key
      return child !== null && typeof child === 'object' && !Array.isArray(child)
        ? [path, ...paths(child, path)]
        : [`${path}:${typeof child}`]
    })
    .sort()
}

const messages = locales.map((locale) =>
  paths(
    JSON.parse(readFileSync(new URL(`../src/messages/${locale}.json`, import.meta.url), 'utf8')),
  ),
)
for (let index = 1; index < locales.length; index++) {
  const expected = new Set(messages[0])
  const actual = new Set(messages[index])
  const missing = [...expected].filter((key) => !actual.has(key))
  const extra = [...actual].filter((key) => !expected.has(key))
  if (missing.length || extra.length) {
    throw new Error(
      `Translation key mismatch (${locales[index]}): missing [${missing.join(', ')}]; extra [${extra.join(', ')}]`,
    )
  }
}
console.log('JSON translation parity (recursive): en, id')
