# LinkLocker

LinkLocker is a bookmark manager that helps you save, organize, edit, filter, and delete bookmarks from both a CLI and a web UI.

## What It Does

- Save bookmarks with URL, title, tags, and notes
- View and delete bookmarks
- Edit bookmarks from the web UI
- Search/filter bookmarks by tag in both CLI and web
- Share the same SQLite data between CLI and web

## Components

- `apps/cli`
  - Command-line menu for adding, listing, deleting, and searching bookmarks by tag.
- `apps/web`
  - Next.js web interface with dashboard, add form, edit form, and API routes.
- `packages/bookmark-manager`
  - Business logic component: validation, tag normalization, update/delete/search rules.
- `packages/database`
  - Encapsulated SQLite component for low-level data operations.

## Shared Database

- Main database file: `packages/database/linklocker.db`
- Both CLI and web read/write this same file.

## Setup

```bash
npm run setup
```

## Run CLI

```bash
npm run dev:cli
```

## Run Web

```bash
npm run dev:web
```

Then open `http://localhost:3000` (or the fallback port shown in terminal).

## Run Tests

```bash
npm run test
```
