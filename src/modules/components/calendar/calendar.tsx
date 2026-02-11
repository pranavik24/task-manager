import React from "react";
import { CalendarBody } from "@/modules/components/calendar/calendar-body";
import { CalendarProvider } from "@/modules/components/calendar/contexts/calendar-context";
import { DndProvider } from "@/modules/components/calendar/contexts/dnd-context";
import { CalendarHeader } from "@/modules/components/calendar/header/calendar-header";
import { getEvents, getTasks, getUsers } from "@/modules/components/calendar/requests";

async function getCalendarData() {
	return {
		events: await getEvents(),
		tasks: await getTasks(),
		users: await getUsers(),
	};
}

export async function Calendar() {
	const { events, tasks, users } = await getCalendarData();

	return (
		<CalendarProvider events={events} tasks={tasks} users={users} view="month">
			<DndProvider showConfirmation={false}>
				<div className="w-full rounded-xl border bg-white shadow-sm">
					<CalendarHeader />
					<CalendarBody />
				</div>
			</DndProvider>
		</CalendarProvider>
	);
}
