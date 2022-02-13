import { jsonStrToHtmlSpans } from "./mod.ts"
import {assert} from 'https://deno.land/std@0.125.0/testing/asserts.ts'
import { PrettyJsonLow } from "./PrettyJsonLow.ts";
import { stringToCodePoints } from "./utils.ts";

const {test} = Deno

const str = `{
  "a": 1, 
  "b": "3", 
  "c": true, 
  "d": null, 
  "e": [5, 4], 
  "f": {
    "a": [], 
    "b": {}
  }
}`

test('jsonStrToHtmlSpans', () => {
  assert(jsonStrToHtmlSpans(str).includes('<span class="inter">:</span>'))
})

let ret = ''
const s = PrettyJsonLow(new Proxy({
  end() {
    console.log(ret)
  }
}, {
  get(target, prop: string, rec) {
    // @ts-ignore
    return target[prop] ?? ((...args) => {
      if (args.length > 0) ret += String.fromCodePoint(args[0])
    })
  }
}))

for (const point of stringToCodePoints(str)) {
  s.codePoint(point)
}
s.end()