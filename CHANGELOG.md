# Changelog

All notable changes to **MarkdownJet** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.0.1] - 2026-05-05

### Added

- **Single-tab custom editor** for `.md` / `.markdown` files via `CustomTextEditorProvider`.
- **Three view modes** in the tab title bar:
  - 编辑 / Edit  — CodeMirror 6 only
  - 双栏 / Both  — editor + preview side-by-side, scroll synced
  - 预览 / Preview — rendered HTML only
- **Window-level shared mode**: switching mode on one `.md` propagates to all
  open `.md` files in the same VS Code window.
- **CodeMirror 6 editor** with line numbers, Markdown syntax highlighting,
  multi-cursor, find/replace, bracket matching, and Tab indent.
- **Live preview** powered by `markdown-it`:
  - GitHub-flavored typography (themed via VS Code CSS variables)
  - Syntax-highlighted fenced code blocks via **highlight.js**
    (`github` / `github-dark` themes auto-switching)
  - **Mermaid 10.x** diagrams (flowchart, sequence, class, state, pie, gantt, ER, …)
  - **KaTeX** math (`$inline$` and `$$block$$`)
  - Locally bundled vendor assets — no CDN, fast first paint
- **Outline TreeView** in the Explorer panel; clicking a heading reveals
  the corresponding line in the editor and scrolls the preview.
- **Bidirectional scroll sync** in `both` mode via `data-source-line`
  attributes injected by markdown-it.
- **Basic Markdown lint** (MD001 / MD009 / MD012 / MD018 / MD034) reported
  to the Problems panel.
- **Insert helpers** with keybindings: table (`Cmd+Alt+T`), link (`Cmd+Alt+L`),
  image (`Cmd+Alt+I`), and a simple formatter (`Shift+Alt+F`).
- **VS Code theme integration**: editor + preview + tab-bar buttons all
  use `--vscode-*` CSS variables and respond to live theme changes.
- **12 theme-aware tab-bar icons** (3 modes × active/inactive × light/dark).
- Mode switch keybindings: `Cmd+1` / `Cmd+2` / `Cmd+3`.
