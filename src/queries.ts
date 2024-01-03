import { createInlayHint, quickInfoRequest } from './helpers'

import type * as coc from 'coc.nvim'

const twoslashQueryRegex = /^\s*\/\/\.?\s*\^\?/gm // symbol: ^?

interface Query {
  text: string
  offset: number
  model: coc.TextDocument
  cancel: coc.CancellationToken
}

type InlayHintsPromise = Promise<coc.InlayHint[]>

export async function checkTwoslashQuery({
  text,
  offset,
  model,
  cancel,
}: Query): InlayHintsPromise {
  const results: coc.InlayHint[] = []
  const m = text.matchAll(twoslashQueryRegex)

  for (const match of m) {
    if (typeof match.index === 'undefined') {
      break
    }

    const end = match.index + match[0].length - 1
    const endPos = model.positionAt(end + offset)

    if (cancel.isCancellationRequested) {
      return []
    }

    const hint = await quickInfoRequest(model, {
      line: endPos.line - 1,
      character: endPos.character,
    })
    const inlayHint = createInlayHint({ hint, position: endPos })

    if (inlayHint) {
      results.push(inlayHint)
    }
  }

  return results
}
