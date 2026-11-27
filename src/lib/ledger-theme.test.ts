import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const css = readFileSync(new URL('../app/globals.css', import.meta.url), 'utf8')
const rgb = (hex: string) =>
  [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16) / 255)
const luminance = (color: number[]) =>
  color.reduce(
    (sum, value, index) =>
      sum +
      (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4) *
        [0.2126, 0.7152, 0.0722][index],
    0,
  )
const contrast = (left: number[], right: number[]) => {
  const [low, high] = [luminance(left), luminance(right)].sort((a, b) => a - b)
  return (high + 0.05) / (low + 0.05)
}

describe('Soft Sky semantic token contrast', () => {
  for (const theme of [':root', '.dark']) {
    const block = css.split(`${theme} {`)[1].split('}')[0]
    const tokens = Object.fromEntries(
      [...block.matchAll(/--([\w-]+): (#[\da-f]{6});/g)].map((match) => [match[1], rgb(match[2])]),
    )
    it(`${theme} keeps text, primary actions and control boundaries readable`, () => {
      for (const [text, surface] of [
        ['foreground', 'card'],
        ['foreground', 'background'],
        ['muted-foreground', 'card'],
        ['primary-foreground', 'primary'],
      ]) {
        expect(
          contrast(tokens[text], tokens[surface]),
          `${text} / ${surface}`,
        ).toBeGreaterThanOrEqual(4.5)
      }
      for (const token of ['ring', 'input'])
        expect(contrast(tokens[token], tokens.card), token).toBeGreaterThanOrEqual(3)
    })
    it(`${theme} keeps labeled statuses readable on their tinted surfaces`, () => {
      for (const token of ['success', 'warning', 'destructive', 'info']) {
        const color = tokens[token]
        const background = color.map((value, index) => value * 0.1 + tokens.card[index] * 0.9)
        expect(contrast(color, background), token).toBeGreaterThanOrEqual(4.5)
      }
    })
  }
})
