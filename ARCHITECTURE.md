# Life OS Architecture Documentation

## Project Overview

Life OS is a minimalist personal life management dashboard designed to enhance productivity and personal growth through intuitive task and habit tracking. The application focuses on user engagement and motivational design while maintaining data persistence between sessions.

## Key Features

- **Task Management**: Create, track, and complete daily tasks
- **Habit Tracking**: Boolean and counter-based habits with customizable repeat schedules
- **Life Categories**: Organize goals/habits across Health, Career, Finances, and Personal domains
- **Theme Support**: Toggle between dark and light modes with persistent preferences
- **Data Persistence**: JSON-based local storage for reliable data across sessions
- **Daily Logging**: Automatic archiving of daily data for future visualization and reporting

## Tech Stack

### Frontend
- **React**: Component-based UI library for building the user interface
- **TypeScript**: Type-safe JavaScript for improved developer experience
- **Tailwind CSS**: Utility-first CSS framework for responsive styling
- **shadcn/ui**: Component library built on Radix UI primitives for accessible UI components
- **Wouter**: Lightweight routing library for page navigation
- **TanStack Query (React Query)**: Data fetching and caching library
- **React Hook Form**: Form validation and management
- **date-fns**: Date manipulation utilities

### Backend
- **Express.js**: Node.js web application framework for handling API requests
- **TypeScript**: Used on both frontend and backend for type consistency
- **JSON File Storage**: Custom MemStorage implementation for data persistence
- **Zod**: Schema validation library for type-safe data validation

### Build & Development
- **Vite**: Modern frontend build tool for fast development and optimized production builds
- **TSX**: TypeScript execution environment for running Node.js with TypeScript
- **Drizzle ORM**: Database ORM for schema definitions and future database integration
- **ESBuild**: Fast JavaScript bundler

## Application Architecture

### Directory Structure

```
├── client/                # Frontend React application
│   ├── src/
│   │   ├── components/    # UI components
│   │   │   ├── ui/        # Base UI components from shadcn
│   │   │   └── ...        # App-specific components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Shared utilities & context providers
│   │   ├── pages/         # Page components for different routes
│   │   └── App.tsx        # Main application component & routing
│
├── server/                # Backend Express application  
│   ├── index.ts           # Server entry point
│   ├── routes.ts          # API route definitions
│   ├── storage.ts         # Data storage implementation
│   └── vite.ts            # Vite integration for server
│
├── shared/                # Shared code between frontend and backend
│   └── schema.ts          # Database/entity schemas & types
│
├── data/                  # Data storage directory
│   ├── logs/              # Daily log storage
│   │   └── daily/         # Organized by date (YYYY-MM-DD)
│   ├── habits.json        # Current habits data
│   ├── tasks.json         # Current tasks data
│   └── counters.json      # ID counters for entities
```

### Data Flow

1. **Frontend to Backend**:
   - React components render UI based on state
   - TanStack Query manages data fetching and state
   - API requests are sent to Express backend endpoints
   - Response data is cached and used to update UI

2. **Backend to Storage**:
   - Express routes receive API requests
   - Routes invoke methods on the storage interface
   - MemStorage implementation manages CRUD operations
   - Data is persisted to JSON files in the data directory

3. **Settings & Preferences**:
   - User settings managed through React Context
   - Theme preference and day start time stored and persisted
   - Settings synchronized with backend when changed

4. **Daily Reset Logic**:
   - Habits reset based on user-defined day start time
   - Previous state is archived in daily logs before reset
   - Task and habit data stored in date-specific directories

### Key Components

#### Frontend Components

- **Header**: Main navigation and date display with settings access
- **TaskSection**: Task list display and management
- **HabitSection**: Habit tracking and visualization
- **SettingsModal**: Configuration for appearance, timing, and data management
- **LifeCategories**: Navigation between different life domains
- **CreateHabitDialog**: Form for creating and editing habits

#### Backend Services

- **MemStorage**: JSON-based storage implementation with CRUD operations
- **Express Routes**: RESTful API endpoints for data access and manipulation
- **Daily Logging**: Automatic data archiving for historical tracking

## Data Model

### Task

```typescript
interface Task {
  id: number;
  text: string;
  completed: boolean;
  createdAt: string; // ISO date string
}
```

### Habit

```typescript
interface Habit {
  id: number;
  name: string;
  type: 'boolean' | 'counter';
  value?: number;
  maxValue?: number;
  status?: 'completed' | 'failed';
  repeatType: 'daily' | 'weekly';
  repeatDays: string; // Comma-separated days (1=Monday, 7=Sunday)
  lastReset?: string; // ISO date string
  isActiveToday?: boolean; // Computed property
}
```

## API Endpoints

### Tasks
- `GET /api/tasks`: Retrieve all tasks
- `GET /api/tasks/:id`: Retrieve a specific task
- `POST /api/tasks`: Create a new task
- `PATCH /api/tasks/:id`: Update a task
- `DELETE /api/tasks/:id`: Delete a task

### Habits
- `GET /api/habits`: Retrieve all habits
- `GET /api/habits/:id`: Retrieve a specific habit
- `POST /api/habits`: Create a new habit
- `PATCH /api/habits/:id`: Update a habit
- `PATCH /api/habits/:id/complete`: Mark a habit as completed
- `PATCH /api/habits/:id/fail`: Mark a habit as failed
- `PATCH /api/habits/:id/increment`: Increment a counter habit
- `PATCH /api/habits/:id/decrement`: Decrement a counter habit
- `DELETE /api/habits/:id`: Delete a habit
- `POST /api/reset-habits`: Reset all habits for a new day

### Settings
- `GET /api/day-start-time`: Get the configured day start time
- `POST /api/day-start-time`: Update the day start time

## Future Enhancements

1. **Database Integration**: Migration from JSON files to a full database with Drizzle ORM
2. **Data Visualization**: Reporting and insights from historical daily logs
3. **Mobile Optimization**: Additional responsive design for mobile-first experience
4. **User Authentication**: Multi-user support with secure authentication
5. **Cloud Synchronization**: Data backup and sync across devices
6. **Notifications**: Reminders for habits and important tasks

## Deployment Considerations

- **File Permissions**: Ensure data directory is writable in production
- **Data Backup**: Implement regular backups of the data directory
- **Environment Variables**: Configure using environment variables for production settings
- **Error Handling**: Comprehensive error handling for production stability
- **Logging**: Production-ready logging for monitoring and debugging