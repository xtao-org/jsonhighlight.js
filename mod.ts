import {JsonLow} from 'https://raw.githubusercontent.com/xtao-org/jsonhilo/master/mod.js'

export const jsonStrToHtmlSpans = (str: string) => {
  let ret = '<span class="json">'

  const object = (codePoint: number) => {
    ret += `<span class="object">${String.fromCodePoint(codePoint)}`
  }
  const array = (codePoint: number) => {
    ret += `<span class="array">${String.fromCodePoint(codePoint)}`
  }
  const inter = (codePoint: number) => {
    ret += `<span class="inter">${String.fromCodePoint(codePoint)}</span>`
  }
  const close = (codePoint: number) => {
    ret += `${String.fromCodePoint(codePoint)}</span>`
  }

  const boolean = (codePoint: number) => {
    ret += `<span class="boolean">${String.fromCodePoint(codePoint)}`
  }
  const stream = JsonLow(new Proxy({
    openKey: (codePoint: number) => {
      ret += `<span class="key">${String.fromCodePoint(codePoint)}`
    },
    openObject: object,
    openArray: array,
    openNumber: (codePoint: number) => {
      ret += `<span class="number">${String.fromCodePoint(codePoint)}`
    },
    openString: (codePoint: number) => {
      ret += `<span class="string">${String.fromCodePoint(codePoint)}`
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
      ret += `</span>`
    },
    end: () => {
      ret += `</span>`
    },
  }, {
    get(target, prop: string, rec) {
      // @ts-ignore
      return target[prop] ?? ((codePoint: number) => {
        ret += String.fromCodePoint(codePoint)
      })
    }
  }))

  for (const point of stringToCodePoints(str)) {
    stream.codePoint(point)
  }
  stream.end()

  return ret
}

const stringToCodePoints = (str: string) => {
  const points = []
  for (let i = 0; i < str.length; ++i) {
    points.push(str.codePointAt(i))
  }
  return points
}