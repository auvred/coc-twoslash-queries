import * as coc from 'coc.nvim'
import { languages } from 'coc.nvim'

import { checkTwoslashQuery } from './queries'

export function activate(context: coc.ExtensionContext): void {
  registerInlayHintsProvider(context)
  registerInsertTwoSlashQueryCommand(context)
}

function registerInlayHintsProvider(context: coc.ExtensionContext): void {
  const provider: coc.InlayHintsProvider = {
    provideInlayHints: async (model, iRange, cancel) => {
      const offset = model.offsetAt(iRange.start)
      const text = model.getText(iRange)
      return await checkTwoslashQuery({ text, offset, model, cancel })
    },
  }

  context.subscriptions.push(
    languages.registerInlayHintsProvider(
      [
        { language: 'javascript' },
        { language: 'javascriptreact' },
        { language: 'typescript' },
        { language: 'typescriptreact' },
      ],
      provider,
    ),
  )
}

function registerInsertTwoSlashQueryCommand(
  context: coc.ExtensionContext,
): void {
  context.subscriptions.push(
    coc.commands.registerCommand('twoslash.insertTwoslashQuery', async () => {
      const { document, position } = await coc.workspace.getCurrentState()

      const eolRange = document.lineAt(position.line).range.end
      const comment = `\n${'//'.padEnd(position.character, ' ').concat('^?')}`

      const d = await coc.workspace.document
      d.applyEdits([
        {
          newText: comment,
          range: { start: eolRange, end: eolRange },
        },
      ])
    }),
  )
}
