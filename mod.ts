import {JsonLow} from 'https://raw.githubusercontent.com/xtao-org/jsonhilo/master/mod.js'
import { PrettyJsonLow } from "./PrettyJsonLow.ts";
import { stringToCodePoints } from "./utils.ts";
import {argsToJevko} from 'https://cdn.jsdelivr.net/gh/jevko/jevkoutils.js@v0.1.6/mod.js'

type Node = (string | Node)[]

export const jsonStrToHtmlSpans = (str: string, {pretty = false} = {}) => {
  const ancestors: Node[] = []
  let parent: Node = ["class=", ["json"], []]
  const ret = ["span", parent]

  const object = (codePoint: number) => {
    ancestors.push(parent)
    const node = ["class=", ["object"], [String.fromCodePoint(codePoint)]]
    parent.push("span", node)
    parent = node
  }
  const array = (codePoint: number) => {
    ancestors.push(parent)
    const node = ["class=", ["array"], [String.fromCodePoint(codePoint)]]
    parent.push("span", node)
    parent = node
  }
  const inter = (codePoint: number) => {
    parent.push("span", ["class=", ["inter"], [String.fromCodePoint(codePoint)]])
  }
  const close = (codePoint: number) => {
    (parent[parent.length - 1] as string[]).push(String.fromCodePoint(codePoint))
    if (ancestors.length === 0) throw Error('oops')
    parent = ancestors.pop()!
  }

  const boolean = (codePoint: number) => {
    ancestors.push(parent)
    const node = ["class=", ["boolean"], [String.fromCodePoint(codePoint)]]
    parent.push("span", node)
    parent = node
  }

  const ctor = pretty? PrettyJsonLow: JsonLow

  const stream = ctor(new Proxy({
    openKey: (codePoint: number) => {
      ancestors.push(parent)
      const node = ["class=", ["key"], [String.fromCodePoint(codePoint)]]
      parent.push("span", node)
      parent = node
    },
    openObject: object,
    openArray: array,
    openNumber: (codePoint: number) => {
      ancestors.push(parent)
      const node = ["class=", ["number"], [String.fromCodePoint(codePoint)]]
      parent.push("span", node)
      parent = node
    },
    openString: (codePoint: number) => {
      ancestors.push(parent)
      const node = ["class=", ["string"], [String.fromCodePoint(codePoint)]]
      parent.push("span", node)
      parent = node
    },
    colon: inter,
    comma: inter,
    closeString: close,
    closeKey: close,
    closeObject: close,
    closeArray: close,
    openTrue: boolean,
    openFalse: boolean,
    closeTrue: close,
    closeFalse: close,
    closeNumber: () => {
      if (ancestors.length === 0) throw Error('oops')
      parent = ancestors.pop()!
    },
    end: () => {},
  }, {
    get(target, prop: string, _rec) {
      // @ts-ignore x
      return target[prop] ?? ((codePoint: number) => {
        (parent[parent.length - 1] as string[]).push(String.fromCodePoint(codePoint))
      })
    }
  }))

  for (const point of stringToCodePoints(str)) {
    stream.codePoint(point)
  }
  stream.end()

  return argsToJevko(...ret)
}

export {PrettyJsonLow} from './PrettyJsonLow.ts'