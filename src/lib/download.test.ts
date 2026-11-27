import { afterEach, describe, expect, it, vi } from 'vitest'
import { downloadFile } from './download'

afterEach(() => vi.unstubAllGlobals())

describe('downloadFile', () => {
  it.each([
    ['a,b\n1,2', 'export.csv', undefined, 'text/csv;charset=utf-8;'],
    ['﻿a,b', 'custom.txt', 'text/plain', 'text/plain'],
  ])(
    'downloads content unchanged with the requested filename and type',
    async (content, filename, type, expectedType) => {
      const click = vi.fn()
      const link = { href: '', download: '', click }
      const createObjectURL = vi.fn<(blob: Blob) => string>(() => 'blob:download')
      const revokeObjectURL = vi.fn()
      const createElement = vi.fn(() => link)
      vi.stubGlobal('document', { createElement })
      vi.stubGlobal('URL', { createObjectURL, revokeObjectURL })

      downloadFile(content, filename, type)

      const blob = createObjectURL.mock.calls[0]?.[0] as Blob | undefined
      expect(blob?.type).toBe(expectedType)
      expect(new Uint8Array(await blob!.arrayBuffer())).toEqual(new TextEncoder().encode(content))
      expect(blob?.size).toBe(new TextEncoder().encode(content).length)
      expect(createElement).toHaveBeenCalledWith('a')
      expect(link.href).toBe('blob:download')
      expect(link.download).toBe(filename)
      expect(click).toHaveBeenCalledOnce()
      expect(revokeObjectURL).toHaveBeenCalledWith('blob:download')
      expect(click.mock.invocationCallOrder[0]).toBeLessThan(
        revokeObjectURL.mock.invocationCallOrder[0]!,
      )
    },
  )
})
