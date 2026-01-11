import type { TEventColor } from "@/modules/components/calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	title: string;
	location: string;
	color: TEventColor;
	description: string;
	user: IUser;
}

export interface ITask {
	id: number;
	dueDate: string;
	title: string;
	location: string;
	color: TEventColor;
	description: string;
	user: IUser;
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
