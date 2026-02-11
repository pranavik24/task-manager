import { COLORS } from "@/modules/components/calendar/constants";
import type { IEvent, IUser } from "@/modules/components/calendar/interfaces";

export const USERS_MOCK: IUser[] = [
	{
		id: "f3b035ac-49f7-4e92-a715-35680bf63175",
		name: "Michael Doe",
		picturePath: null,
	},
	{
		id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
		name: "Alice Johnson",
		picturePath: null,
	},
	{
		id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
		name: "Robert Smith",
		picturePath: null,
	},
	{
		id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
		name: "Emily Davis",
		picturePath: null,
	},
];

// ================================== //

const events = [
	"Doctor's appointment",
	"Dental cleaning",
	"Eye exam",
	"Therapy session",
	"Business meeting",
	"Team stand-up",
	"Project deadline",
	"Weekly report submission",
	"Client presentation",
	"Marketing strategy review",
	"Networking event",
	"Sales call",
	"Investor pitch",
	"Board meeting",
	"Employee training",
	"Performance review",
	"One-on-one meeting",
	"Lunch with a colleague",
	"HR interview",
	"Conference call",
	"Web development sprint planning",
	"Software deployment",
	"Code review",
	"QA testing session",
	"Cybersecurity audit",
	"Server maintenance",
	"API integration update",
	"Data backup",
	"Cloud migration",
	"System upgrade",
	"Content planning session",
	"Product launch",
	"Customer support review",
	"Team building activity",
	"Legal consultation",
	"Budget review",
	"Financial planning session",
	"Tax filing deadline",
	"Investor relations update",
	"Partnership negotiation",
	"Medical check-up",
	"Vaccination appointment",
	"Blood donation",
	"Gym workout",
	"Yoga class",
	"Physical therapy session",
	"Nutrition consultation",
	"Personal trainer session",
	"Parent-teacher meeting",
	"School open house",
	"College application deadline",
	"Final exam",
	"Graduation ceremony",
	"Job interview",
	"Internship orientation",
	"Office relocation",
	"Business trip",
	"Flight departure",
	"Hotel check-in",
	"Vacation planning",
	"Birthday party",
	"Wedding anniversary",
	"Family reunion",
	"Housewarming party",
	"Community volunteer work",
	"Charity fundraiser",
	"Religious service",
	"Concert attendance",
	"Theater play",
	"Movie night",
	"Sporting event",
	"Football match",
	"Basketball game",
	"Tennis practice",
	"Marathon training",
	"Cycling event",
	"Fishing trip",
	"Camping weekend",
	"Hiking expedition",
	"Photography session",
	"Art workshop",
	"Cooking class",
	"Book club meeting",
	"Grocery shopping",
	"Car maintenance",
	"Home renovation meeting",
];

const mockGenerator = (numberOfEvents: number): IEvent[] => {
	const result: IEvent[] = [];
	let currentId = 1;

	const randomUser = USERS_MOCK[Math.floor(Math.random() * USERS_MOCK.length)];

	// Date range: 30 days before and after now
	const now = new Date();
	const startRange = new Date(now);
	startRange.setDate(now.getDate() - 30);
	const endRange = new Date(now);
	endRange.setDate(now.getDate() + 30);

	// Create an event happening now
	const currentEvent = {
		id: currentId++,
		startDate: new Date(now.getTime() - 30 * 60000).toISOString(),
		endDate: new Date(now.getTime() + 30 * 60000).toISOString(),
		title: events[Math.floor(Math.random() * events.length)],
		color: COLORS[Math.floor(Math.random() * COLORS.length)],
		description:
			"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
		user: randomUser,
	};

	result.push(currentEvent);

	// Generate the remaining events
	for (let i = 0; i < numberOfEvents - 1; i++) {
		// Determine if this is a multi-day event (10% chance)
		const isMultiDay = Math.random() < 0.1;

		const startDate = new Date(
			startRange.getTime() +
				Math.random() * (endRange.getTime() - startRange.getTime()),
		);

		// Set time between 8 AM and 8 PM
		startDate.setHours(
			8 + Math.floor(Math.random() * 12),
			Math.floor(Math.random() * 60),
			0,
			0,
		);

		const endDate = new Date(startDate);

		if (isMultiDay) {
			// Multi-day event: Add 1-4 days
			const additionalDays = Math.floor(Math.random() * 4) + 1;
			endDate.setDate(startDate.getDate() + additionalDays);
			endDate.setHours(
				8 + Math.floor(Math.random() * 12),
				Math.floor(Math.random() * 60),
				0,
				0,
			);
		} else {
			// Same-day event: Add 1-3 hours
			endDate.setHours(endDate.getHours() + Math.floor(Math.random() * 3) + 1);
		}

		result.push({
			id: currentId++,
			startDate: startDate.toISOString(),
			endDate: endDate.toISOString(),
			title: events[Math.floor(Math.random() * events.length)],
			color: COLORS[Math.floor(Math.random() * COLORS.length)],
			description:
				"Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
			user: USERS_MOCK[Math.floor(Math.random() * USERS_MOCK.length)],
		});
	}

	return result;
};

const createEvent = (
	id: number,
	date: Date,
	startHour: number,
	startMinute: number,
	endHour: number,
	endMinute: number,
	title: string,
	location: string,
	color: IEvent["color"],
	description: string,
): IEvent => {
	const eventStart = new Date(date);
	eventStart.setHours(startHour, startMinute, 0, 0);

	const eventEnd = new Date(date);
	eventEnd.setHours(endHour, endMinute, 0, 0);

	return {
		id,
		startDate: eventStart.toISOString(),
		endDate: eventEnd.toISOString(),
		title,
		location,
		color,
		description,
		user: USERS_MOCK[0],
	};
};

const hashDate = (date: Date): number => {
	const y = date.getFullYear();
	const m = date.getMonth() + 1;
	const d = date.getDate();
	return y * 10000 + m * 100 + d;
};

const pickByDate = <T,>(date: Date, items: T[]): T => {
	return items[hashDate(date) % items.length];
};

const generateSchoolAndActivities = (
	pastWeeks = 26,
	futureWeeks = 26,
): IEvent[] => {
	const result: IEvent[] = [];
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const startDate = new Date(today);
	startDate.setDate(today.getDate() - pastWeeks * 7);
	const endDate = new Date(today);
	endDate.setDate(today.getDate() + futureWeeks * 7);
	let currentId = 1;

	for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
		const currentDate = new Date(date);
		const dayOfWeek = date.getDay();
		const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

		if (isWeekday) {
			result.push(
				createEvent(
					currentId++,
					currentDate,
					7,
					40,
					14,
					30,
					"School",
					"School",
					"School",
					"Weekday school schedule.",
				),
			);
		}

		// Sports games on Friday evenings
		if (dayOfWeek === 5) {
			const gameTitle = pickByDate(currentDate, [
				"Travel Game",
				"At Home Game",
				"Homecoming Game",
				"Rivalry Game",
			]);
			const gameTime = pickByDate(currentDate, [
				{ startHour: 18, startMinute: 0, endHour: 20, endMinute: 0 },
				{ startHour: 18, startMinute: 30, endHour: 20, endMinute: 30 },
				{ startHour: 19, startMinute: 0, endHour: 21, endMinute: 0 },
			]);

			result.push(
				createEvent(
					currentId++,
					currentDate,
					gameTime.startHour,
					gameTime.startMinute,
					gameTime.endHour,
					gameTime.endMinute,
					gameTitle,
					"School Field",
					"Extracurriculars",
					"Evening game with the team.",
				),
			);
		}

		// Sports practice on some weekday afternoons (Tue/Thu)
		if (dayOfWeek === 2 || dayOfWeek === 4) {
			const practiceTitle = pickByDate(currentDate, [
				"Skills & Drills",
				"Conditioning Practice",
				"Strategy Session",
				"Team Practice",
			]);
			const practiceTime = pickByDate(currentDate, [
				{ startHour: 15, startMinute: 30, endHour: 17, endMinute: 0 },
				{ startHour: 15, startMinute: 45, endHour: 17, endMinute: 15 },
				{ startHour: 16, startMinute: 0, endHour: 17, endMinute: 30 },
			]);

			result.push(
				createEvent(
					currentId++,
					currentDate,
					practiceTime.startHour,
					practiceTime.startMinute,
					practiceTime.endHour,
					practiceTime.endMinute,
					practiceTitle,
					"Gym",
					"Extracurriculars",
					"Afternoon training block.",
				),
			);
		}

		// Weekend get-togethers (occasional, not every week)
		if (dayOfWeek === 6 || dayOfWeek === 0) {
			const weekendSeed = hashDate(currentDate);
			const includeGetTogether = weekendSeed % 3 === 0;
			if (!includeGetTogether) continue;

			const socialTitle = pickByDate(currentDate, [
				"Crew Hangout",
				"Weekend Meetup",
				"Pizza & Game Night",
				"Park Catch-Up",
			]);
			const socialLocation = pickByDate(currentDate, [
				"Community Center",
				"Downtown Park",
				"Friend's House",
				"City Rec Hall",
			]);
			const socialTime = pickByDate(currentDate, [
				{ startHour: 14, startMinute: 30, endHour: 16, endMinute: 0 },
				{ startHour: 16, startMinute: 0, endHour: 18, endMinute: 0 },
				{ startHour: 17, startMinute: 30, endHour: 19, endMinute: 30 },
			]);

			result.push(
				createEvent(
					currentId++,
					currentDate,
					socialTime.startHour,
					socialTime.startMinute,
					socialTime.endHour,
					socialTime.endMinute,
					socialTitle,
					socialLocation,
					"Other",
					"Casual weekend social plan.",
				),
			);
		}
	}

	return result;
};

export const CALENDAR_ITEMS_MOCK: IEvent[] = generateSchoolAndActivities();
