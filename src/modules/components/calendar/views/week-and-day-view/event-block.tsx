import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { differenceInMinutes, parseISO } from "date-fns";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { useCalendar } from "@/modules/components/calendar/contexts/calendar-context";
import { EventDetailsDialog } from "@/modules/components/calendar/dialogs/event-details-dialog";
import { DraggableEvent } from "@/modules/components/calendar/dnd/draggable-event";
import { ResizableEvent } from "@/modules/components/calendar/dnd/resizable-event";
import { formatTime } from "@/modules/components/calendar/helpers";
import type { IEvent } from "@/modules/components/calendar/interfaces";

const calendarWeekEventCardVariants = cva(
	"flex select-none flex-col gap-0.5 truncate whitespace-nowrap rounded-md border px-2 py-1.5 text-xs focus-visible:outline-offset-2",
	{
		variants: {
			color: {
				// Colored variants
				School:
					"border-indigo-200 bg-indigo-100/50 text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-950",
				Extracurriculars:
					"border-green-200 bg-green-100/50 text-green-700 hover:bg-green-100 dark:border-green-800 dark:bg-green-950/50 dark:text-green-300 dark:hover:bg-green-950",
				Other:
					"border-slate-200 bg-slate-100/50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:bg-slate-900",
				Homework:
					"border-cyan-200 bg-cyan-100/50 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300 dark:hover:bg-cyan-950",
				Work:
					"border-amber-200 bg-amber-100/50 text-amber-800 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300 dark:hover:bg-amber-950",

				// Dot variants
				"School-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-indigo-600 dark:[&_svg]:fill-indigo-500",
				"Extracurriculars-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-green-600 dark:[&_svg]:fill-green-500",
				"Other-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-slate-600 dark:[&_svg]:fill-slate-500",
				"Work-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-amber-600 dark:[&_svg]:fill-amber-500",
				"Homework-dot":
					"border-border bg-card text-foreground hover:bg-accent [&_svg]:fill-cyan-600 dark:[&_svg]:fill-cyan-500",
			},
		},
		defaultVariants: {
			color: "Other-dot",
		},
	},
);

interface IProps
	extends HTMLAttributes<HTMLDivElement>,
		Omit<VariantProps<typeof calendarWeekEventCardVariants>, "color"> {
	event: IEvent;
}

export function EventBlock({ event, className }: IProps) {
	const { badgeVariant, use24HourFormat } = useCalendar();

	const start = parseISO(event.startDate);
	const end = parseISO(event.endDate);
	const durationInMinutes = differenceInMinutes(end, start);
	const heightInPixels = (durationInMinutes / 60) * 96 - 8;

	const color = (
		badgeVariant === "dot" ? `${event.color}-dot` : event.color
	) as VariantProps<typeof calendarWeekEventCardVariants>["color"];

	const calendarWeekEventCardClasses = cn(
		calendarWeekEventCardVariants({ color, className }),
		durationInMinutes < 35 && "py-0 justify-center",
	);

	return (
		<ResizableEvent event={event}>
			<DraggableEvent event={event}>
				<EventDetailsDialog event={event}>
					<div
						role="button"
						tabIndex={0}
						className={calendarWeekEventCardClasses}
						style={{ height: `${heightInPixels}px` }}
					>
						<div className="flex items-center gap-1.5 truncate">
							{badgeVariant === "dot" && (
								<svg
									width="8"
									height="8"
									viewBox="0 0 8 8"
									className="shrink-0"
								>
									<circle cx="4" cy="4" r="4" />
								</svg>
							)}

							<p className="truncate font-semibold">{event.title}</p>
						</div>

						{durationInMinutes > 25 && (
							<p>
								{formatTime(start, use24HourFormat)} -{" "}
								{formatTime(end, use24HourFormat)}
							</p>
						)}
					</div>
				</EventDetailsDialog>
			</DraggableEvent>
		</ResizableEvent>
	);
}
