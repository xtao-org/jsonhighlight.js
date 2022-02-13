import { jsonStrToHtmlSpans } from "./mod.ts"
import {assert} from 'https://deno.land/std@0.125.0/testing/asserts.ts'

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