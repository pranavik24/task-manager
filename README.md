# Octomind Calender


A feature-rich calendar application built with React, TypeScript, and ShadCN UI components. This project provides a customizable and interactive calendar experience with multiple views, event management, and a modern UI.

<img width="1790" height="977" alt="Screenshot 2025-08-05 at 15 00 40" src="https://github.com/user-attachments/assets/0f7bd8a4-59b2-4f4d-aaa9-b0655129e474" />

**Live Demo:** [https://calendar.jeraidi.tech](https://calendar.jeraidi.tech)

## Key Features

- **Multiple Views**: Day, Week, Month, Year, and Agenda views
- **Event Management**: Create, edit, and delete events
- **Drag & Drop**: Move events between time slots and dates
- **Event Resizing**: Resize events in day and week views with smooth animations
- **User Management**: Multi-user support with user filtering
- **Color Coding**: Events can be color-coded for better organization
- **Responsive Design**: Works seamlessly across all device sizes
- **Dark Mode**: Full dark mode support
- **24/12 Hour Format**: Toggle between 24-hour and 12-hour time formats

## Installation

Use your preferred package manager to install the calendar component directly from the custom ShadCN UI registry:

```bash
npx shadcn@latest add "https://calendar.jeraidi.tech/r/full-calendar.json"
```

## Usage

Import and use the `Calendar` component in your page:

```tsx
import React, { Suspense } from "react";
import { Calendar } from "@/modules/components/calendar/calendar";
import { CalendarSkeleton } from "@/modules/components/calendar/skeletons/calendar-skeleton";

export default function CalendarPage() {
  return (
    <Suspense fallback={<CalendarSkeleton />}>
      <Calendar />
    </Suspense>
  );
}
```

## Project Structure

Here's an overview of the important files and directories in the project:

```
src/
├── modules/
│   └── components/
│       └── calendar/
│           ├── calendar.tsx          # Main entry point component. Fetches data and wraps the app in providers.
│           ├── contexts/
│           │   ├── calendar-context.tsx  # Core state management (events, users, view state, filters).
│           │   └── dnd-context.tsx       # Drag-and-drop context provider.
│           ├── header/
│           │   └── calendar-header.tsx   # Top navigation bar (view switcher, date nav, filters).
│           ├── views/                    # Contains specific view components (Day, Week, Month, Year, Agenda).
│           ├── calendar-body.tsx         # Renders the active view based on current state.
│           ├── helpers.ts                # Core utility functions for date manipulation and calendar logic.
│           ├── hooks.ts                  # Custom hooks for calendar logic.
│           └── types.ts                  # TypeScript definitions for events, users, and views.
```

## How It Works

The project is architected around a central context provider that manages the state of the calendar. Here is the high-level flow:

1.  **Initialization**:

    - The `Calendar` component (`src/components/calendar/calendar.tsx`) serves as the entry point.
    - It fetches initial data (events and users) and initializes the `CalendarProvider`.

2.  **State Management**:

    - `CalendarContext` holds the application state, including the current view (Day, Week, Month, etc.), selected date, list of events, and active filters.
    - It uses `localStorage` to persist user preferences such as the preferred view, time format (12h/24h), and badge styles.

3.  **Rendering Logic**:

    - The `CalendarHeader` allows users to navigate dates, switch views, and apply filters.
    - The `CalendarBody` listens to the `view` state from the context and dynamically renders the appropriate view component (e.g., `MonthView`, `WeekView`).

4.  **Interactions**:
    - **Drag & Drop**: The `DndProvider` wraps the calendar to enable drag-and-drop functionality for events. When an event is moved, the context updates the event's start and end times.
    - **Event Management**: Functions like `addEvent`, `updateEvent`, and `removeEvent` in the context handle CRUD operations, ensuring the UI stays in sync with the data.

## Running Locally

To run the project locally, follow these steps:

1.  **Clone the repository**:

    ```bash
    git clone https://github.com/yassir-jeraidi/full-calendar.git
    cd full-calendar
    ```

2.  **Install dependencies**:

    ```bash
    pnpm install
    ```

3.  **Start the development server**:

    ```bash
    pnpm dev
    ```

4.  **Open the application**:

    Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.
