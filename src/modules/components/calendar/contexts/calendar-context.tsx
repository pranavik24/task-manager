"use client";

import type React from "react";
import { createContext, useContext, useState, useMemo } from "react";
import {
	addHours,
	subHours,
	addDays,
	addWeeks,
	addMonths,
	addYears,
	differenceInDays,
	startOfDay,
} from "date-fns";
import { useLocalStorage } from "@/modules/components/calendar/hooks";
import type { IEvent, IUser, ITask } from "@/modules/components/calendar/interfaces";
import type {
	TCalendarView,
	TEventColor,
} from "@/modules/components/calendar/types";

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

const normalizeTaskDurationHours = (hours?: number): number => {
	if (typeof hours !== "number" || Number.isNaN(hours)) return 1;
	const rounded = Math.round(hours * 2) / 2;
	return Math.min(8, Math.max(0.5, rounded));
};

const CalendarContext = createContext({} as ICalendarContext);

export function CalendarProvider({
	children,
	users,
	events,
	tasks = [],
	badge = "colored",
	view = "day",
}: {
	children: React.ReactNode;
	users: IUser[];
	events: IEvent[];
	tasks?: ITask[];
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

	const [allTasks, setAllTasks] = useState<ITask[]>(tasks || []);
	const [filteredTasks, setFilteredTasks] = useState<ITask[]>(tasks || []);

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
				const eventColor = event.color || "Other";
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
		// If the event contains recurrence info, expand into multiple occurrences
		if (event.recurrence && (event.recurrence.count && event.recurrence.count > 1)) {
			const freq = event.recurrence.freq;
			const interval = event.recurrence.interval || 1;
			const count = event.recurrence.count || 1;
			const baseStart = new Date(event.startDate);
			const baseEnd = new Date(event.endDate);
			const occurrences: IEvent[] = [];

			// If weekly and byweekday provided, generate by scanning days forward and honoring interval
			if (event.recurrence && event.recurrence.freq === "weekly" && event.recurrence.byweekday && event.recurrence.byweekday.length > 0) {
				const weekdays = (event.recurrence.byweekday || []) as number[]; // 0..6
				let cursor = new Date(baseStart);
				let created = 0;
				while (created < count) {
					const weekIndex = Math.floor(differenceInDays(cursor, baseStart) / 7);
					const inIntervalWeek = weekIndex % interval === 0;
					if (inIntervalWeek && weekdays.includes(cursor.getDay()) && cursor >= baseStart) {
						const s = new Date(cursor);
						const duration = baseEnd.getTime() - baseStart.getTime();
						const e = new Date(s.getTime() + duration);
						occurrences.push({
							...event,
							id: Math.floor(Math.random() * 1000000000),
							startDate: s.toISOString(),
							endDate: e.toISOString(),
						});
						created += 1;
					}
					cursor = addDays(cursor, 1);
				}
			} else {
				for (let i = 0; i < count; i++) {
					let s = new Date(baseStart);
					let e = new Date(baseEnd);
					const step = i * interval;
					switch (freq) {
						case "daily":
							s = addDays(baseStart, step);
							e = addDays(baseEnd, step);
							break;
						case "weekly":
							s = addWeeks(baseStart, step);
							e = addWeeks(baseEnd, step);
							break;
						case "monthly":
							s = addMonths(baseStart, step);
							e = addMonths(baseEnd, step);
							break;
						case "yearly":
							s = addYears(baseStart, step);
							e = addYears(baseEnd, step);
							break;
						default:
							s = addDays(baseStart, step);
							e = addDays(baseEnd, step);
					}

					occurrences.push({
						...event,
						id: Math.floor(Math.random() * 1000000000),
						startDate: s.toISOString(),
						endDate: e.toISOString(),
					});
				}
			}

			setAllEvents((prev) => [...prev, ...occurrences]);
			setFilteredEvents((prev) => [...prev, ...occurrences]);
			return;
		}

		// Non-recurring event
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

	const hasOverlap = (start: Date, end: Date, ignoreTaskId?: number) => {
		for (const e of allEvents) {
			const es = new Date(e.startDate);
			const ee = new Date(e.endDate);
			if (start < ee && es < end) return true;
		}

		for (const t of allTasks) {
			if (ignoreTaskId !== undefined && t.id === ignoreTaskId) continue;
			const ts = new Date(t.dueDate);
			const te = addHours(ts, normalizeTaskDurationHours(t.estimatedHours));
			if (start < te && ts < end) return true;
		}

		return false;
	};

	const findTaskSlot = (
		requested: Date,
		ignoreTaskId?: number,
		durationHours = 1,
	): Date | null => {
		const dueDayStart = startOfDay(requested);
		const oneHourMs = 60 * 60 * 1000;
		const minGapBeforeDueMs = oneHourMs;
		const taskDurationHours = normalizeTaskDurationHours(durationHours);
		const preferredHours = [10, 11, 13, 14, 15, 16, 9, 12, 17];
		const reasonableHours = [...preferredHours, 8, 18, 7, 19];
		const allDayHours = Array.from({ length: 24 }, (_, i) => i);
		const dueDayEnd = new Date(dueDayStart);
		dueDayEnd.setDate(dueDayEnd.getDate() + 1);

		const schoolEventsToday = allEvents.filter((event) => {
			if (event.title !== "School") return false;
			const start = new Date(event.startDate);
			return start >= dueDayStart && start < dueDayEnd;
		});

		const schoolEndPlusOneHour =
			schoolEventsToday.length > 0
				? addHours(
						schoolEventsToday
							.map((event) => new Date(event.endDate))
							.reduce((latest, current) =>
								current > latest ? current : latest,
							),
						1,
				  )
				: null;

		const isValidCandidate = (
			hour: number,
			options: {
				mustBeBeforeDue: boolean;
				enforceGapBeforeDue: boolean;
				enforceSchoolGap: boolean;
			},
		) => {
			const candidateStart = new Date(dueDayStart);
			candidateStart.setHours(hour, 0, 0, 0);
			const candidateEnd = addHours(candidateStart, taskDurationHours);

			if (options.mustBeBeforeDue && candidateEnd > requested) return null;
			if (
				options.enforceGapBeforeDue &&
				requested.getTime() - candidateEnd.getTime() < minGapBeforeDueMs
			) {
				return null;
			}
			if (
				options.enforceSchoolGap &&
				schoolEndPlusOneHour &&
				candidateStart < schoolEndPlusOneHour
			) {
				return null;
			}
			if (hasOverlap(candidateStart, candidateEnd, ignoreTaskId)) return null;
			return candidateStart;
		};

		const findCandidate = (
			hours: number[],
			options: {
				mustBeBeforeDue: boolean;
				enforceGapBeforeDue: boolean;
				enforceSchoolGap: boolean;
			},
		) => {
			for (const hour of hours) {
				const candidate = isValidCandidate(hour, options);
				if (candidate) return candidate;
			}
			return null;
		};

		const dueDayCandidate =
			findCandidate(preferredHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: true,
				enforceSchoolGap: true,
			}) ??
			findCandidate(reasonableHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: true,
				enforceSchoolGap: true,
			}) ??
			findCandidate(preferredHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: false,
				enforceSchoolGap: true,
			}) ??
			findCandidate(reasonableHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: false,
				enforceSchoolGap: true,
			}) ??
			findCandidate(preferredHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: true,
				enforceSchoolGap: false,
			}) ??
			findCandidate(reasonableHours, {
				mustBeBeforeDue: true,
				enforceGapBeforeDue: true,
				enforceSchoolGap: false,
			}) ??
			findCandidate(preferredHours, {
				mustBeBeforeDue: false,
				enforceGapBeforeDue: false,
				enforceSchoolGap: false,
			}) ??
			findCandidate(reasonableHours, {
				mustBeBeforeDue: false,
				enforceGapBeforeDue: false,
				enforceSchoolGap: false,
			});

		if (dueDayCandidate) return dueDayCandidate;

		// Last resort: search backward up to one week. Never return an overlapping slot.
		let candidate = new Date(requested);
		candidate.setMinutes(0, 0, 0);
		if (addHours(candidate, taskDurationHours) > requested) {
			candidate = subHours(candidate, 1);
		}

		const MAX_ITER = 24 * 7;
		let iter = 0;
		while (iter < MAX_ITER) {
			const candidateEnd = addHours(candidate, taskDurationHours);
			if (!hasOverlap(candidate, candidateEnd, ignoreTaskId)) return candidate;
			candidate = subHours(candidate, 1);
			iter += 1;
		}

		// Final fallback: same-day any-hour scan (to avoid returning an overlap).
		return findCandidate(allDayHours, {
			mustBeBeforeDue: false,
			enforceGapBeforeDue: false,
			enforceSchoolGap: false,
		});
	};

	const addTask = (task: ITask) => {
		const requested = new Date(task.dueDate);
		const estimatedHours = normalizeTaskDurationHours(task.estimatedHours);
		const candidate = findTaskSlot(requested, undefined, estimatedHours);
		if (!candidate) throw new Error("No free slot available for task");

		const taskToAdd: ITask = {
			...task,
			dueDate: candidate.toISOString(),
			estimatedHours,
		};

		setAllTasks((prev) => [...prev, taskToAdd]);
		setFilteredTasks((prev) => [...prev, taskToAdd]);
	};

	const updateTask = (task: ITask) => {
		const requested = new Date(task.dueDate);
		const estimatedHours = normalizeTaskDurationHours(task.estimatedHours);
		const candidate = findTaskSlot(requested, task.id, estimatedHours);
		if (!candidate) throw new Error("No free slot available for task");

		const updated = {
			...task,
			dueDate: candidate.toISOString(),
			estimatedHours,
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
	// shows tasks as estimated-hour blocks at their dueDate. Tasks remain separately
	// available via `tasks` on the context for other UI.
	const mergedEvents = useMemo(() => {
		const taskAsEvents: IEvent[] = filteredTasks.map((t) => ({
			id: t.id,
			startDate: new Date(t.dueDate).toISOString(),
			endDate: addHours(
				new Date(t.dueDate),
				normalizeTaskDurationHours(t.estimatedHours),
			).toISOString(),
			title: t.title,
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
