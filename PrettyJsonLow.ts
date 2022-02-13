import { JsonLow } from "https://raw.githubusercontent.com/xtao-org/jsonhilo/master/JsonLow.js";

const space = ' '.codePointAt(0)
const newline = '\n'.codePointAt(0)

export const PrettyJsonLow = (next: any) => {
  const indent = () => {
    for (let i = 0; i < currentIndent; ++i) {
      next.whitespace?.(space)
    }
  }

  const indentSize = 2
  let currentIndent = 0
  let prevIndent = 0
  let justOpened = false
  let buffer: (() => any)[] = []
  const stream = JsonLow(new Proxy({
    openObject: (codePoint: number) => {
      prevIndent = currentIndent
      currentIndent += indentSize

      next.openObject?.(codePoint)
      justOpened = true
      buffer.push(() => next.whitespace?.(newline), indent)
      // next.whitespace?.(newline)
      // indent()
    },
    closeObject: (codePoint: number) => {
      currentIndent = prevIndent
      prevIndent -= indentSize

      if (justOpened) {
        justOpened = false
        buffer = []
      } else {
        next.whitespace?.(newline)
        indent()
      }

      next.closeObject?.(codePoint)
    }, 
    openArray: (codePoint: number) => {
      prevIndent = currentIndent
      currentIndent += indentSize
      next.openArray?.(codePoint)
      justOpened = true
      buffer.push(() => next.whitespace?.(newline), indent)
      // next.whitespace?.(newline)
      // indent()
    },
    closeArray: (codePoint: number) => {
      currentIndent = prevIndent
      prevIndent -= indentSize

      // next.whitespace?.(newline)
      // indent()

      if (justOpened) {
        justOpened = false
        buffer = []
      } else {
        next.whitespace?.(newline)
        indent()
      }

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
      // @ts-ignore
      return target[prop] ?? ((...args) => {
        if (justOpened) {
          justOpened = false
          for (const f of buffer) f()
          buffer = []
        }
        next[prop]?.(...args)
      })
    }
  }))

  return stream
}