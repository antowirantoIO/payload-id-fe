import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory() ? files(join(directory, entry.name)) : [join(directory, entry.name)],
      ),
    )
  ).flat()
}

const allowed = new Set(['client', 'server', 'actions', 'contracts'])
const violations = []
for (const file of await files('src')) {
  if (!/\.(ts|tsx)$/.test(file)) continue
  const source = await readFile(file, 'utf8')
  for (const match of source.matchAll(/from\s+['"]@\/features\/([^'"\n]+)['"]/g)) {
    const [, path] = match
    const [, ...segments] = path.split('/')
    if (segments.length > 1 || (segments.length === 1 && !allowed.has(segments[0])))
      violations.push(`${relative('.', file)}: ${path}`)
  }
}
if (violations.length) {
  console.error(violations.join('\n'))
  process.exitCode = 1
} else console.log('Feature boundaries: all imports use public entry points.')
