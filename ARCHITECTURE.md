# Life OS - Architecture Overview

## Introduction

Life OS is a personal productivity and habit tracking application designed to help users organize and manage various aspects of their life in one centralized dashboard. The application follows a modern full-stack JavaScript architecture with a React frontend and Express backend.

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL (with Drizzle ORM)
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: Wouter for client-side routing
- **Authentication**: Custom PIN/passcode authentication
- **Offline Support**: IndexedDB with sync capabilities

## Application Structure

```
├── client/                  # Frontend codebase
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utility functions and shared code
│   │   ├── pages/           # Page components for different routes
│   │   ├── App.tsx          # Main application component
│   │   └── main.tsx         # Application entry point
│
├── server/                  # Backend codebase
│   ├── index.ts             # Express server setup and initialization
│   ├── routes.ts            # API route definitions
│   ├── storage.ts           # Data storage implementation
│   └── vite.ts              # Vite configuration for development
│
├── shared/                  # Shared code between client and server
│   └── schema.ts            # Database schema definitions with Drizzle
│
└── functions/               # Serverless functions (for deployment)
```

## Core Features

### 1. Habit Tracking

- Track daily and weekly habits
- Boolean habits (completed/failed) and counter-based habits
- Automatic habit reset based on configurable day start time
- Ability to view all habits and edit/delete them

### 2. Task Management

- Simple to-do list functionality
- Mark tasks as completed/incomplete
- Add new tasks with a single input field

### 3. Life Category Notes

- Organize notes by life categories (Health, Career, Finances, Personal)
- Markdown editor for rich text formatting
- Automatic saving of notes

### 4. Offline Support

- IndexedDB for local storage
- Background synchronization when reconnected to the internet
- Pending actions queue for conflict resolution

### 5. Authentication & Security

- PIN/passcode-based authentication
- Device-specific authentication
- Option to reset passcode through settings
- Environment variable-based default passcode ("6969")
- Client-side fallback for offline authentication

### 6. Settings & Customization

- Configurable day start time
- Dark/light theme toggle
- Habit reset functionality
- Data management options

## Data Flow

1. **Client-Side**:
   - React components use TanStack Query to fetch data from the API
   - Form submissions use React Hook Form with Zod validation
   - Offline changes are stored in IndexedDB and synced when online

2. **Server-Side**:
   - Express routes handle API requests
   - Data is stored using the storage implementation
   - Authentication middleware validates requests

3. **Data Synchronization**:
   - Background sync service regularly checks for pending actions
   - Conflicts are resolved using timestamps and defined strategies
   - Failed actions remain in the queue for retry

## Deployment

The application is configured for deployment on Netlify with the following setup:

- Frontend assets are built and served from the `dist` directory
- Backend API is deployed as serverless functions
- Netlify redirects handle API routing and SPA navigation
- PostgreSQL database is accessed through environment variables

### Environment Variables

The application uses environment variables for configuration:

- `DEFAULT_PASSCODE`: Sets the default passcode for server-side authentication (defaults to "6969")
- `VITE_DEFAULT_PASSCODE`: Client-side version of the default passcode for offline mode
- Environment variables are configured in:
  - `.env` file for local development
  - `netlify.toml` for production deployment with the `[build.environment]` section

## Future Enhancements

- User accounts with cloud synchronization
- Data visualization and habit statistics
- Mobile application with React Native
- Expanded categories and customization options
- Calendar integration for scheduling