# Life OS

A dynamic personal Life OS dashboard that transforms productivity tracking into an engaging, adaptive user experience through intelligent design and interactive features.

## Features

- **Habit Tracking**: Track daily and weekly habits with boolean or counter-based completion
- **Task Management**: Simple to-do list functionality
- **Life Category Notes**: Organize notes by life categories (Health, Career, Finances, Personal)
- **Offline Support**: IndexedDB for local storage with background synchronization
- **Authentication**: PIN/passcode-based authentication with device-specific verification

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file based on `.env.example`
4. Start the development server:
   ```
   npm run dev
   ```

## Authentication

The application uses a passcode-based authentication system. By default, the passcode is set to `6969`. You can change this by modifying the following environment variables:

- `DEFAULT_PASSCODE`: Controls the server-side default passcode
- `VITE_DEFAULT_PASSCODE`: Controls the client-side default passcode for offline mode

These variables can be set in:

- `.env` file for local development
- `netlify.toml` in the `[build.environment]` section for deployment

## Deployment

The application is configured for deployment on Netlify:

1. Connect your repository to Netlify
2. Configure the build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Add environment variables in the Netlify dashboard or use the `netlify.toml` file

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Express
- Vite
- IndexedDB
- Markdown
- Shadcn UI
- Drizzle ORM
- Netlify

## Architecture

See [architecture.md](./architecture.md) for a detailed overview of the application architecture.

## License

This project is licensed under the MIT License.