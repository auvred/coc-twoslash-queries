import * as coc from 'coc.nvim'

import type ts from 'typescript/lib/tsserverlibrary'

export async function quickInfoRequest(
  model: coc.TextDocument,
  position: coc.Position,
): Promise<ts.server.protocol.QuickInfoResponse | undefined> {
  // eslint-disable-next-line ts/no-explicit-any
  const tsserverService = coc.services.getService('tsserver') as any
  if (!tsserverService) {
    return
  }

  // https://github.com/neoclide/coc-tsserver/blob/9ff880ef3fbf1680daefe4dacfafdce8ffd2817b/src/server/index.ts#L15
  const { clientHost } = tsserverService

  // https://github.com/neoclide/coc-tsserver/blob/9ff880ef3fbf1680daefe4dacfafdce8ffd2817b/src/server/typescriptServiceClientHost.ts#L37
  const client = clientHost?.client

  // https://github.com/neoclide/coc-tsserver/blob/9ff880ef3fbf1680daefe4dacfafdce8ffd2817b/src/server/typescriptServiceClient.ts#L613
  const execute = client?.execute

  return await (execute?.('quickinfo', {
    file: coc.Uri.parse(model.uri).fsPath,
    line: position.line + 1,
    offset: position.character,
  } satisfies ts.server.protocol.FileLocationRequestArgs) as Promise<
    ts.server.protocol.QuickInfoResponse | undefined
  >)
}

interface InlayHintInfo {
  hint: ts.server.protocol.QuickInfoResponse | undefined
  position: coc.Position
  lineLength?: number
}

export function createInlayHint({
  hint,
  position,
  lineLength = 0,
}: InlayHintInfo): coc.InlayHint | undefined {
  if (!hint || !hint.body) {
    return
  }

  // Make a one-liner
  let text = hint.body.displayString
    .replaceAll('\\n', ' ')
    .replaceAll('/n', ' ')
    .replaceAll('  ', ' ')
    .replaceAll(/[\u0000-\u001F\u007F-\u009F]/g, '')

  // Cut off hint if too long
  // If microsoft/coc#174159 lands, can change to check that
  // TODO: check if we can do this with coc.nvim
  const availableSpace = 120 - lineLength
  if (text.length > availableSpace) {
    text = `${text.slice(0, availableSpace - 1)}...`
  }

  return {
    kind: 1 /* InlayHintKind.Type */,
    position: { line: position.line, character: position.character + 1 },
    label: text,
    paddingLeft: true,
  }
}
