import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { endOfDay, isSameDay, parseISO, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/modules/components/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/modules/components/calendar/dialogs/event-details-dialog";
import { DraggableEvent } from "@/modules/components/calendar/dnd/draggable-event";
import { formatTime } from "@/modules/components/calendar/helpers";
import type { IEvent } from "@/modules/components/calendar/interfaces";
import {EventBullet} from "@/modules/components/calendar/views/month-view/event-bullet";

const eventBadgeVariants = cva(
	"mx-1 flex size-auto h-6.5 select-none items-center justify-between gap-1.5 truncate whitespace-nowrap rounded-md border px-2 text-xs",
	{
		variants: {
			color: {
				// Colored variants
				School:
					"border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300",
				Extracurriculars:
					"border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
				Other:
					"border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
				Homework:
					"border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300",
				Studying:
					"border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300",
				Work:
					"border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300",

				// Dot variants
				"School-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-indigo-600",
				"Extracurriculars-dot":
					"bg-bg-secondary text-t-primary [&_svg]:fill-green-600",
				"Other-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-slate-600",
				"Work-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-amber-600",
				"Studying-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-violet-600",
				"Homework-dot": "bg-bg-secondary text-t-primary [&_svg]:fill-cyan-600",
			},
			multiDayPosition: {
				first:
					"relative z-10 mr-0 rounded-r-none border-r-0 [&>span]:mr-2.5",
				middle:
					"relative z-10 mx-0 w-[calc(100%_+_1px)] rounded-none border-x-0",
				last: "ml-0 rounded-l-none border-l-0",
				none: "",
			},
		},
		defaultVariants: {
			color: "Other-dot",
		},
	},
);

interface IProps
	extends Omit<
		VariantProps<typeof eventBadgeVariants>,
		"color" | "multiDayPosition"
	> {
	event: IEvent;
	cellDate: Date;
	eventCurrentDay?: number;
	eventTotalDays?: number;
	className?: string;
	position?: "first" | "middle" | "last" | "none";
}

export function MonthEventBadge({
	event,
	cellDate,
	eventCurrentDay,
	eventTotalDays,
	className,
	position: propPosition,
}: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const itemStart = startOfDay(parseISO(event.startDate));
	const itemEnd = endOfDay(parseISO(event.endDate));

	if (cellDate < itemStart || cellDate > itemEnd) return null;

	let position: "first" | "middle" | "last" | "none" | undefined;

	if (propPosition) {
		position = propPosition;
	} else if (eventCurrentDay && eventTotalDays) {
		position = "none";
	} else if (isSameDay(itemStart, itemEnd)) {
		position = "none";
	} else if (isSameDay(cellDate, itemStart)) {
		position = "first";
	} else if (isSameDay(cellDate, itemEnd)) {
		position = "last";
	} else {
		position = "middle";
	}

	const renderBadgeText = ["first", "none"].includes(position) ;
	const renderBadgeTime =  ["last", "none"].includes(position);

	const color = (
		badgeVariant === "dot" ? `${event.color}-dot` : event.color
	) as VariantProps<typeof eventBadgeVariants>["color"];

	const eventBadgeClasses = cn(
		eventBadgeVariants({ color, multiDayPosition: position, className }),
	);

	return (
		<DraggableEvent event={event}>
			<EventDetailsDialog event={event}>
				<div role="button" tabIndex={0} className={eventBadgeClasses}>
					<div className="flex items-center gap-1.5 truncate">
						{!["middle", "last"].includes(position) &&
							badgeVariant === "dot" && (
								<EventBullet color={event.color} />
							)}

						{renderBadgeText && (
							<p className="flex-1 truncate font-semibold">
								{eventCurrentDay && (
									<span className="text-xs">
										Day {eventCurrentDay} of {eventTotalDays} •{" "}
									</span>
								)}
								{event.title}
							</p>
						)}
					</div>

					<div className="hidden sm:block">
						{renderBadgeTime && (
							<span>
							{formatTime(new Date(event.startDate), use24HourFormat)}
						</span>
						)}
					</div>
				</div>
			</EventDetailsDialog>
		</DraggableEvent>
	);
}
