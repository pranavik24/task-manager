import {
	CALENDAR_ITEMS_MOCK,
	TASK_ITEMS_MOCK,
	USERS_MOCK,
} from "@/modules/components/calendar/mocks";

export const getEvents = async () => {
	return CALENDAR_ITEMS_MOCK;
};

export const getUsers = async () => {
	return USERS_MOCK;
};

export const getTasks = async () => {
	return TASK_ITEMS_MOCK;
};
