"use client";

import type React from "react";
import { createContext, useContext, useState, useMemo } from "react";
import { addHours, subHours } from "date-fns";
import { useLocalStorage } from "@/modules/components/calendar/hooks";
import type { IEvent, IUser, ITask } from "@/modules/components/calendar/interfaces";
import type {
	TCalendarView,
	TEventColor,
} from "@/modules/components/calendar/types";
import { subtractHours } from "../helpers";

interface ICalendarContext {
	selectedDate: Date;
	view: TCalendarView;
	setView: (view: TCalendarView) => void;
	agendaModeGroupBy: "date" | "color";
	setAgendaModeGroupBy: (groupBy: "date" | "color") => void;
	use24HourFormat: boolean;
	toggleTimeFormat: () => void;
	setSelectedDate: (date: Date | undefined) => void;
	selectedUserId: IUser["id"] | "all";
	setSelectedUserId: (userId: IUser["id"] | "all") => void;
	badgeVariant: "dot" | "colored";
	setBadgeVariant: (variant: "dot" | "colored") => void;
	selectedColors: TEventColor[];
	filterEventsBySelectedColors: (colors: TEventColor) => void;
	filterEventsBySelectedUser: (userId: IUser["id"] | "all") => void;
	users: IUser[];
	events: IEvent[];
	tasks: ITask[];
	addEvent: (event: IEvent) => void;
	updateEvent: (event: IEvent) => void;
	removeEvent: (eventId: number) => void;
	clearFilter: () => void;
	addTask: (task: ITask) => void;
	updateTask: (task: ITask) => void;
	removeTask: (taskId: number) => void;

}

interface CalendarSettings {
	badgeVariant: "dot" | "colored";
	view: TCalendarView;
	use24HourFormat: boolean;
	agendaModeGroupBy: "date" | "color";
}

const DEFAULT_SETTINGS: CalendarSettings = {
	badgeVariant: "colored",
	view: "day",
	use24HourFormat: true,
	agendaModeGroupBy: "date",
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
	children,
	users,
	events,
	badge = "colored",
	view = "day",
}: {
	children: React.ReactNode;
	users: IUser[];
	events: IEvent[];
	view?: TCalendarView;
	badge?: "dot" | "colored";
}) {
	const [settings, setSettings] = useLocalStorage<CalendarSettings>(
		"calendar-settings",
		{
			...DEFAULT_SETTINGS,
			badgeVariant: badge,
			view: view,
		},
	);

	const [badgeVariant, setBadgeVariantState] = useState<"dot" | "colored">(
		settings.badgeVariant,
	);
	const [currentView, setCurrentViewState] = useState<TCalendarView>(
		settings.view,
	);
	const [use24HourFormat, setUse24HourFormatState] = useState<boolean>(
		settings.use24HourFormat,
	);
	const [agendaModeGroupBy, setAgendaModeGroupByState] = useState<
		"date" | "color"
	>(settings.agendaModeGroupBy);

	const [selectedDate, setSelectedDate] = useState(new Date());
	const [selectedUserId, setSelectedUserId] = useState<IUser["id"] | "all">(
		"all",
	);
	const [selectedColors, setSelectedColors] = useState<TEventColor[]>([]);

	const [allEvents, setAllEvents] = useState<IEvent[]>(events || []);
	const [filteredEvents, setFilteredEvents] = useState<IEvent[]>(events || []);

	const [allTasks, setAllTasks] = useState<ITask[]>([]);
	const [filteredTasks, setFilteredTasks] = useState<ITask[]>([]);

	const updateSettings = (newPartialSettings: Partial<CalendarSettings>) => {
		setSettings({
			...settings,
			...newPartialSettings,
		});
	};

	const setBadgeVariant = (variant: "dot" | "colored") => {
		setBadgeVariantState(variant);
		updateSettings({ badgeVariant: variant });
	};

	const setView = (newView: TCalendarView) => {
		setCurrentViewState(newView);
		updateSettings({ view: newView });
	};

	const toggleTimeFormat = () => {
		const newValue = !use24HourFormat;
		setUse24HourFormatState(newValue);
		updateSettings({ use24HourFormat: newValue });
	};

	const setAgendaModeGroupBy = (groupBy: "date" | "color") => {
		setAgendaModeGroupByState(groupBy);
		updateSettings({ agendaModeGroupBy: groupBy });
	};

	const filterEventsBySelectedColors = (color: TEventColor) => {
		const isColorSelected = selectedColors.includes(color);
		const newColors = isColorSelected
			? selectedColors.filter((c) => c !== color)
			: [...selectedColors, color];

		if (newColors.length > 0) {
			const filtered = allEvents.filter((event) => {
				const eventColor = event.color || "blue";
				return newColors.includes(eventColor);
			});
			setFilteredEvents(filtered);
		} else {
			setFilteredEvents(allEvents);
		}

		setSelectedColors(newColors);
	};

	const filterEventsBySelectedUser = (userId: IUser["id"] | "all") => {
		setSelectedUserId(userId);
		if (userId === "all") {
			setFilteredEvents(allEvents);
		} else {
			const filtered = allEvents.filter((event) => event.user.id === userId);
			setFilteredEvents(filtered);
		}
	};

	const handleSelectDate = (date: Date | undefined) => {
		if (!date) return;
		setSelectedDate(date);
	};

	const addEvent = (event: IEvent) => {
		setAllEvents((prev) => [...prev, event]);
		setFilteredEvents((prev) => [...prev, event]);
	};

	const updateEvent = (event: IEvent) => {
		const updated = {
			...event,
			startDate: new Date(event.startDate).toISOString(),
			endDate: new Date(event.endDate).toISOString(),
		};

		setAllEvents((prev) => prev.map((e) => (e.id === event.id ? updated : e)));
		setFilteredEvents((prev) =>
			prev.map((e) => (e.id === event.id ? updated : e)),
		);
	};

	const removeEvent = (eventId: number) => {
		setAllEvents((prev) => prev.filter((e) => e.id !== eventId));
		setFilteredEvents((prev) => prev.filter((e) => e.id !== eventId));
	};

	const addTask = (task: ITask) => {
		// Find the latest free 1-hour slot that ENDS BEFORE the requested dueDate.
		// We scan backwards hour-by-hour from the requested time (rounded to hour)
		// up to a MAX_ITER limit (one week by default).
		const requested = new Date(task.dueDate);

		// normalize to the start of the hour
		let candidate = new Date(requested);
		candidate.setMinutes(0, 0, 0);

		// ensure the candidate hour ends before or at the requested due date
		if (addHours(candidate, 1) > requested) {
			candidate = subHours(candidate, 1);
		}

		const MAX_ITER = 24 * 7; // search up to one week backwards
		let iter = 0;

		const overlaps = (start: Date, end: Date) => {
			// check against events
			for (const e of allEvents) {
				const es = new Date(e.startDate);
				const ee = new Date(e.endDate);
				if (start < ee && es < end) return true;
			}
			// check against existing tasks (1-hour slots)
			for (const t of allTasks) {
				const ts = new Date(t.dueDate);
				const te = addHours(new Date(t.dueDate), 1);
				if (start < te && ts < end) return true;
			}
			return false;
		};

		while (iter < MAX_ITER) {
			const candidateEnd = addHours(candidate, 1);
			if (!overlaps(candidate, candidateEnd)) break;
			candidate = subHours(candidate, 1);
			iter += 1;
		}

		const taskToAdd: ITask = {
			...task,
			dueDate: candidate.toISOString(),
		};

		setAllTasks((prev) => [...prev, taskToAdd]);
		setFilteredTasks((prev) => [...prev, taskToAdd]);
	};

	const updateTask = (task: ITask) => {
		const updated = {
			...task,
			dueDate: new Date(task.dueDate).toISOString(),
		};

		setAllTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
		setFilteredTasks((prev) =>
			prev.map((t) => (t.id === task.id ? updated : t)),
		);
	};

	const removeTask = (taskId: number) => {
		setAllTasks((prev) => prev.filter((t) => t.id !== taskId));
		setFilteredTasks((prev) => prev.filter((t) => t.id !== taskId));
	};	

	const clearFilter = () => {
		setFilteredEvents(allEvents);
		setSelectedColors([]);
		setSelectedUserId("all");
	};

	// Merge tasks into the events list so the calendar UI (which consumes `events`)
	// shows tasks as 1-hour blocks at their dueDate. Tasks remain separately
	// available via `tasks` on the context for other UI.
	const mergedEvents = useMemo(() => {
		const taskAsEvents: IEvent[] = filteredTasks.map((t) => ({
			id: t.id,
			startDate: new Date(t.dueDate).toISOString(),
			endDate: addHours(new Date(t.dueDate), 1).toISOString(),
			title: t.title,
			location: t.location,
			color: t.color,
			description: t.description,
			user: t.user,
		}));

		return [...filteredEvents, ...taskAsEvents];
	}, [filteredEvents, filteredTasks]);

	const value = {
		selectedDate,
		setSelectedDate: handleSelectDate,
		selectedUserId,
		setSelectedUserId,
		badgeVariant,
		setBadgeVariant,
		users,
		selectedColors,
		filterEventsBySelectedColors,
		filterEventsBySelectedUser,
		events: mergedEvents,
		tasks: filteredTasks,
		addTask,
		updateTask,
		removeTask,
		view: currentView,
		use24HourFormat,
		toggleTimeFormat,
		setView,
		agendaModeGroupBy,
		setAgendaModeGroupBy,
		addEvent,
		updateEvent,
		removeEvent,
		clearFilter,
	};

	return (
		<CalendarContext.Provider value={value}>
			{children}
		</CalendarContext.Provider>
	);
}

export function useCalendar(): ICalendarContext {
	const context = useContext(CalendarContext);
	if (!context)
		throw new Error("useCalendar must be used within a CalendarProvider.");
	return context;
}
