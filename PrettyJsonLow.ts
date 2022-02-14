import { JsonLow } from "https://raw.githubusercontent.com/xtao-org/jsonhilo/master/JsonLow.js";

const space = ' '.codePointAt(0)
const newline = '\n'.codePointAt(0)

export const PrettyJsonLow = (next: any) => {
  const indent = () => {
    for (let i = 0; i < currentIndent; ++i) {
      next.whitespace?.(space)
    }
  }

  const bufferIndent = () => {
    justOpened = true
    buffer.push(() => next.whitespace?.(newline), indent)
  }

  const flushIndent = () => {
    if (justOpened) {
      justOpened = false
      for (const f of buffer) f()
      buffer = []
    }
  }

  const closeIndent = () => {
    if (justOpened) {
      justOpened = false
      buffer = []
    } else {
      next.whitespace?.(newline)
      indent()
    }
  }

  const indentSize = 2
  let currentIndent = 0
  let prevIndent = 0
  let justOpened = false
  let buffer: (() => any)[] = []
  const stream = JsonLow(new Proxy({
    openObject: (codePoint: number) => {
      flushIndent()
      prevIndent = currentIndent
      currentIndent += indentSize

      next.openObject?.(codePoint)

      bufferIndent()
    },
    closeObject: (codePoint: number) => {
      currentIndent = prevIndent
      prevIndent -= indentSize

      closeIndent()

      next.closeObject?.(codePoint)
    }, 
    openArray: (codePoint: number) => {
      flushIndent()

      prevIndent = currentIndent
      currentIndent += indentSize
      next.openArray?.(codePoint)
      
      bufferIndent()
    },
    closeArray: (codePoint: number) => {
      currentIndent = prevIndent
      prevIndent -= indentSize
      
      closeIndent()

      next.closeArray?.(codePoint)
    }, 
    comma: (codePoint: number) => {
      next.comma?.(codePoint)
      next.whitespace?.(newline)
      indent()
    },
    colon: (codePoint: number) => {
      next.colon?.(codePoint)
      next.whitespace?.(space)
    },
    whitespace: () => {},
  }, {
    get(target, prop: string, rec) {
      // @ts-ignore x
      return target[prop] ?? ((...args) => {
        flushIndent()
        next[prop]?.(...args)
      })
    }
  }))

  return stream
}