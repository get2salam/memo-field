# Memo Field

Capture notes with context, signal, and next action before they dissolve.

![Memo Field preview](docs/preview.svg)

Memo Field is a local-first workspace for founders, operators, and solo builders who want a cleaner way to manage memos. It keeps recall value, context, next action, and review timing visible so the right things move forward with less drift.

## What it does

- ranks memos by leverage, recall value, timing, and friction
- tracks **context**, **next action**, **review date**, and **recall value** for each memo
- highlights the best current bet, the next review slot, and the strongest signal on the board
- renders a dedicated queue plus a category mix snapshot beneath the main board
- saves locally in the browser with JSON import/export backups
- quick action: **Link note**
- quick action: **Raise recall value**
- quick action: **Mark actioned**

## Why it feels different

Memo Field is not just a generic list. It is shaped around the real workflow behind memos, so the board helps you decide what matters next instead of simply storing records.

## Quick start

```bash
git clone https://github.com/get2salam/memo-field.git
cd memo-field
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Keyboard shortcuts

- `N` creates a new memo
- `/` focuses the search box

## Privacy

Everything stays in your browser unless you export a JSON backup.

## License

MIT
