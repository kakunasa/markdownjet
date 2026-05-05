import * as vscode from 'vscode';
import { MarkdownEditorProvider } from './editor/markdownEditor';
import { registerEditCommands } from './edit/editCommands';
import { MarkdownLinter } from './lint/linter';
import { OutlineProvider } from './outline/outlineProvider';

const DISMISSED_KEY = 'markdownJet.dismissedDefaultPrompt';

export function activate(context: vscode.ExtensionContext) {
  console.log('[markdownJet] activated, registering custom editor markdownJet.editor');
  context.subscriptions.push(MarkdownEditorProvider.register(context));

  context.subscriptions.push(
    vscode.commands.registerCommand('markdownJet.openInTextEditor', async (uri?: vscode.Uri) => {
      const target = uri ?? MarkdownEditorProvider.activeDoc?.uri;
      if (!target) {
        vscode.window.showWarningMessage('No Markdown file to open');
        return;
      }
      await vscode.commands.executeCommand('vscode.openWith', target, 'default');
    }),

    vscode.commands.registerCommand('markdownJet.setAsDefault', async () => {
      await setMarkdownJetAsDefault();
      vscode.window.showInformationMessage(
        '✓ MarkdownJet is now the default editor for *.md and *.markdown. ' +
        'Reopen any markdown file to see the change.'
      );
    }),

    vscode.commands.registerCommand('markdownJet.resetDefaultPrompt', async () => {
      await context.globalState.update(DISMISSED_KEY, undefined);
      vscode.window.showInformationMessage('MarkdownJet "set as default" prompt re-enabled.');
    })
  );

  registerEditCommands(context);

  const linter = new MarkdownLinter();
  context.subscriptions.push(linter);

  const outline = new OutlineProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('markdownJetOutline', outline),
    vscode.window.onDidChangeActiveTextEditor(() => outline.refresh()),
    vscode.window.tabGroups.onDidChangeTabs(() => outline.refresh()),
    vscode.workspace.onDidChangeTextDocument((e) => {
      const active = vscode.window.activeTextEditor?.document
        ?? MarkdownEditorProvider.activeDoc;
      if (active && e.document.uri.toString() === active.uri.toString()) {
        outline.refresh();
      }
    })
  );

  // Run after a short delay so the prompt doesn't appear during VS Code startup.
  setTimeout(() => {
    maybePromptForDefaultEditor(context).catch((err) =>
      console.warn('[markdownJet] default-editor prompt failed', err)
    );
  }, 1500);
}

export function deactivate() {}

/**
 * If the user already has *.md associated with someone else (or hasn't been
 * asked yet), show a one-time notification offering to take over.
 *
 * The decision is remembered in globalState — we never re-prompt unless the
 * user runs `markdownJet.resetDefaultPrompt`.
 */
async function maybePromptForDefaultEditor(context: vscode.ExtensionContext): Promise<void> {
  if (context.globalState.get<boolean>(DISMISSED_KEY)) return;

  const cfg = vscode.workspace.getConfiguration('workbench');
  const assoc = cfg.get<Record<string, string>>('editorAssociations') ?? {};
  const current = assoc['*.md'];

  // Already us → no prompt needed.
  if (current === MarkdownEditorProvider.viewType) return;

  const conflictNote = current
    ? `Currently *.md opens with "${current}".`
    : `*.md does not have an explicit default editor.`;

  const setBtn = 'Set as Default';
  const onceBtn = 'Reopen Current File Only';
  const neverBtn = "Don't Show Again";

  const choice = await vscode.window.showInformationMessage(
    `Make MarkdownJet your default Markdown editor?  ${conflictNote}`,
    setBtn, onceBtn, neverBtn
  );

  if (choice === setBtn) {
    await setMarkdownJetAsDefault();
    vscode.window.showInformationMessage(
      '✓ MarkdownJet set as default. Reopen any *.md tab to switch.'
    );
    await context.globalState.update(DISMISSED_KEY, true);
  } else if (choice === onceBtn) {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document.languageId === 'markdown') {
      await vscode.commands.executeCommand(
        'vscode.openWith', editor.document.uri, MarkdownEditorProvider.viewType
      );
    } else {
      vscode.window.showInformationMessage(
        'Open a Markdown file first, then re-run "MarkdownJet: Set as Default Markdown Editor" if you want.'
      );
    }
    // Don't dismiss — they may want to set as default later.
  } else if (choice === neverBtn) {
    await context.globalState.update(DISMISSED_KEY, true);
  }
  // Closed without choosing → re-prompt next activation.
}

async function setMarkdownJetAsDefault(): Promise<void> {
  const cfg = vscode.workspace.getConfiguration('workbench');
  const existing = cfg.get<Record<string, string>>('editorAssociations') ?? {};
  await cfg.update(
    'editorAssociations',
    {
      ...existing,
      '*.md': MarkdownEditorProvider.viewType,
      '*.markdown': MarkdownEditorProvider.viewType
    },
    vscode.ConfigurationTarget.Global
  );
}
