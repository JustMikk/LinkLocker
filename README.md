# LinkLocker

A modern bookmark manager with both **CLI** and **web interfaces** that share a unified SQLite database. Organize, search, and manage your bookmarks efficiently across terminal and browser.

## Features

### Core Functionality

- **Add Bookmarks**: Save bookmarks with URL, title, tags, and optional notes
- **View Bookmarks**: Browse all saved bookmarks in a clean, organized format
- **Edit Bookmarks**: Update any bookmark's details from the web UI
- **Delete Bookmarks**: Remove bookmarks from either CLI or web interface
- **Tag-Based Search**: Filter and search bookmarks by tags in CLI or web
- **Tag Organization**: Normalize and manage tags across bookmarks

### Dual Interface

- **CLI (Command Line)**: Terminal-based menu for quick bookmark management
- **Web UI**: Modern Next.js interface with responsive dashboard and forms

### Data Integration

- **Shared SQLite Database**: CLI and web share the same data file (`linklocker.db`)
- **Real-Time Sync**: Changes in one interface immediately reflect in the other
- **Persistent Storage**: All bookmarks persisted to local SQLite database

### Validation & Error Handling

- URL format validation
- Tag normalization (lowercase, split by comma/space)
- Helpful error messages for invalid inputs
- Proper HTTP status codes and error responses

## Prerequisites

- **Node.js**: v16.0 or higher
- **npm**: v7.0 or higher (included with Node.js)
- **Git**: For cloning the repository (optional)

Verify your installation:

```bash
node --version
npm --version
```

## Installation

### Step 1: Navigate to the Directory

```bash
cd LinkLocker
```

### Step 2: Install Dependencies

Run the setup script to install all dependencies across the monorepo:

```bash
npm run setup
```

This script will:

- Install root dependencies
- Install dependencies in `apps/web`
- Set up the SQLite database

**Note**: On Windows, you may see npm warnings about native modules (SWC). These are non-critical and don't affect functionality.

### Step 3: Verify Installation

Run the test suite to confirm everything is set up correctly:

```bash
npm run test
```

You should see output indicating all tests passed.

## Project Structure

```
LinkLocker/
├── package.json                 # Root package.json with workspace config
├── README.md                    # This file
├── apps/
│   ├── cli/                     # Command-line interface app
│   │   └── index.js             # CLI menu and readline interface
│   └── web/                     # Next.js web application
│       ├── app/
│       │   ├── page.jsx         # Dashboard (list & filter bookmarks)
│       │   ├── add/
│       │   │   └── page.jsx     # Add new bookmark form
│       │   ├── edit/
│       │   │   └── [id]/
│       │   │       └── page.jsx # Edit existing bookmark form
│       │   └── api/
│       │       └── bookmarks/   # REST API endpoints
│       │           ├── route.js # GET (list/filter), POST (create), DELETE
│       │           └── [id]/
│       │               └── route.js # GET (single), PUT (update), DELETE
│       └── package.json
├── packages/
│   ├── database/                # SQLite database wrapper
│   │   ├── index.js             # Database module
│   │   ├── linklocker.db        # SQLite database file
│   │   └── package.json
│   └── bookmark-manager/        # Business logic component
│       ├── index.js             # Manager module with validation
│       ├── test.js              # Unit tests
│       └── package.json
└── node_modules/
```

## Usage

### Running the CLI

Start the command-line interface:

```bash
npm run dev:cli
```

You'll see a menu with these options:

```
LinkLocker CLI Menu:
1. Add a bookmark
2. View all bookmarks
3. Delete a bookmark
4. Search by tag
5. Exit
```

#### CLI Examples

**Add a bookmark:**

- Select option 1
- Enter URL: `https://github.com`
- Enter title: `GitHub`
- Enter tags: `development, code, tools`
- Enter notes (optional): `Main development platform`

**View bookmarks:**

- Select option 2
- Displays all saved bookmarks with their details

**Search by tag:**

- Select option 4
- Enter tag name: `development`
- Shows all bookmarks tagged with "development"

**Delete a bookmark:**

- Select option 3
- Enter the bookmark ID (shown in listings)
- Bookmark is removed from database

### Running the Web UI

Start the web server:

```bash
npm run dev:web
```

Open your browser to:

```
http://localhost:3001
```

(or the port shown in terminal if 3001 is in use)

#### Web UI Features

**Dashboard (Home Page)**

- View all bookmarks in a responsive grid
- Filter by tag using the search box
- See bookmark title, URL, and tags at a glance
- Edit or delete bookmarks from action buttons

**Add Bookmark Page** (`/add`)

- Form to create new bookmark
- Fields: URL, title, tags, notes
- Real-time validation feedback
- Redirects to dashboard on success

**Edit Bookmark Page** (`/edit/[id]`)

- Pre-populated form with existing bookmark data
- Update any field and save
- Returns to dashboard after successful update

**API Endpoints** (`/api/bookmarks`)

- `GET /api/bookmarks` - List all bookmarks
- `GET /api/bookmarks?tag=development` - Filter by tag
- `GET /api/bookmarks/[id]` - Fetch single bookmark
- `POST /api/bookmarks` - Create new bookmark
- `PUT /api/bookmarks/[id]` - Update bookmark
- `DELETE /api/bookmarks/[id]` - Delete bookmark

## Architecture

### Technology Stack

| Layer              | Technology         | Purpose                                         |
| ------------------ | ------------------ | ----------------------------------------------- |
| **Database**       | SQLite3            | Persistent local data storage                   |
| **Business Logic** | Pure JavaScript    | Bookmark validation, tag processing, operations |
| **CLI**            | Node.js Readline   | Terminal user interface                         |
| **Web Frontend**   | Next.js 14 + React | Modern web UI with Server Components            |
| **Web Styling**    | Tailwind CSS       | Responsive design and styling                   |
| **API**            | Next.js API Routes | RESTful backend for web operations              |
| **Build Tool**     | TurboRepo          | Monorepo orchestration and task running         |

### Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Shared SQLite DB                      │
│              (packages/database/linklocker.db)           │
└────────┬────────────────────────────────────┬────────────┘
         │                                     │
         ▼                                     ▼
    ┌─────────────┐                    ┌──────────────────┐
    │     CLI     │                    │    Web Server    │
    │  (Node.js)  │                    │  (Next.js)       │
    │             │                    │                  │
    │  + Menu     │                    │  + Dashboard     │
    │  + Readline │                    │  + Forms         │
    │  + Validation                    │  + API Routes    │
    │  + Errors   │                    │  + Tailwind CSS  │
    └─────────────┘                    └──────────────────┘
```

### Component Responsibilities

1. **Database** (`packages/database`)
   - Low-level SQLite operations
   - Connection management
   - Schema initialization

2. **Bookmark Manager** (`packages/bookmark-manager`)
   - URL validation
   - Tag normalization
   - CRUD business logic
   - Error handling

3. **CLI** (`apps/cli`)
   - Terminal interface
   - User input handling
   - Display formatting

4. **Web App** (`apps/web`)
   - React UI components
   - Next.js server components
   - API routes
   - Form validation

## Running Tests

Execute the unit test suite:

```bash
npm run test
```

Tests cover:

- URL validation
- Tag parsing and normalization
- Bookmark CRUD operations
- Error handling
- Database integration

## Troubleshooting

### Port Already in Use

If port 3001 (web) is already in use, Next.js will automatically try the next available port. Check the terminal output for the actual port.

### Database Lock Issues

If you encounter "database locked" errors:

- Close all running instances of the app (CLI and web)
- Wait a few seconds
- Try again

### npm Install Errors

On Windows, if you see SWC compilation warnings during install:

- These are non-critical and don't affect functionality
- You can ignore them

If dependency installation fails:

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules
rm -r node_modules

# Reinstall
npm install
```

### Git Integration

Clone the repository (if using version control):

```bash
git clone <repository-url>
cd LinkLocker
npm run setup
```

## Development Workflow

### Modify Bookmark Manager Logic

Edit `packages/bookmark-manager/index.js` and run tests:

```bash
npm run test
```

### Add New Web Pages

Create new files in `apps/web/app/` following Next.js App Router conventions.

### Extend CLI Features

Modify `apps/cli/index.js` to add new menu options.

### Database Schema Changes

Edit `packages/database/index.js` and update the schema in the `init()` method.

## Performance Notes

- **Database**: SQLite provides good performance for small to medium bookmark collections
- **Concurrent Access**: Both CLI and web can safely access the database simultaneously
- **Memory**: Minimal footprint suitable for local development and small deployments

## Future Enhancements

Potential improvements for future iterations:

- Export/import bookmarks (CSV, JSON)
- Bookmark categories
- Custom icons for bookmarks
- Password protection
- Cloud synchronization
- Mobile-responsive improvements
- Dark mode
- Advanced search with AND/OR filters

## License

This project is created for educational purposes.

## Support

For issues or questions:

1. Check the Troubleshooting section above
2. Review error messages in the terminal
3. Verify Node.js and npm versions match requirements
4. Check that all dependencies are installed (`npm run setup`)
