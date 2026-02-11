"use client";

import { cva } from "class-variance-authority";
import { isToday, startOfDay, isSunday, isSameMonth } from "date-fns";
import { motion } from "framer-motion";
import { useMemo, useCallback } from "react";

import { cn } from "@/lib/utils";
import {
  staggerContainer,
  transition,
} from "@/modules/components/calendar/animations";
import { EventListDialog } from "@/modules/components/calendar/dialogs/events-list-dialog";
import { DroppableArea } from "@/modules/components/calendar/dnd/droppable-area";
import { getMonthCellEvents } from "@/modules/components/calendar/helpers";
import { useMediaQuery } from "@/modules/components/calendar/hooks";
import type {
  ICalendarCell,
  IEvent,
} from "@/modules/components/calendar/interfaces";
import { EventBullet } from "@/modules/components/calendar/views/month-view/event-bullet";
import { MonthEventBadge } from "@/modules/components/calendar/views/month-view/month-event-badge";
import { AddEditEventDialog } from "../../dialogs/add-edit-event-dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface IProps {
  cell: ICalendarCell;
  events: IEvent[];
  eventPositions: Record<string, number>;
}

export const dayCellVariants = cva("text-white", {
  variants: {
    color: {
      School: "bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 dark:hover:bg-indigo-400 ",
      Extracurriculars:
        "bg-green-600 dark:bg-green-500 hover:bg-green-700 dark:hover:bg-green-400",
      Other: "bg-slate-600 dark:bg-slate-500 hover:bg-slate-700 dark:hover:bg-slate-400",
      Homework:
        "bg-cyan-600 dark:bg-cyan-500 hover:bg-cyan-700 dark:hover:bg-cyan-400",
      Studying:
        "bg-violet-600 dark:bg-violet-500 hover:bg-violet-700 dark:hover:bg-violet-400",
      Work:
        "bg-amber-600 dark:bg-amber-500 hover:bg-amber-700 dark:hover:bg-amber-400",
    },
  },
  defaultVariants: {
    color: "Other",
  },
});

const MAX_VISIBLE_EVENTS = 3;

export function DayCell({ cell, events, eventPositions }: IProps) {
  const { day, currentMonth, date } = cell;
  const isMobile = useMediaQuery("(max-width: 768px)");

  // Memoize cellEvents and currentCellMonth for performance
  const { cellEvents, currentCellMonth } = useMemo(() => {
    const cellEvents = getMonthCellEvents(date, events, eventPositions);
    const currentCellMonth = startOfDay(
      new Date(date.getFullYear(), date.getMonth(), 1)
    );
    return { cellEvents, currentCellMonth };
  }, [date, events, eventPositions]);

  // Memoize event rendering for each position with animation
  const renderEventAtPosition = useCallback(
    (position: number) => {
      const event = cellEvents.find((e) => e.position === position);
      if (!event) {
        return (
          <motion.div
            key={`empty-${position}`}
            className="lg:flex-1"
            initial={false}
            animate={false}
          />
        );
      }
      const showBullet = isSameMonth(
        new Date(event.startDate),
        currentCellMonth
      );

      return (
        <motion.div
          key={`event-${event.id}-${position}`}
          className="lg:flex-1"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: position * 0.1, ...transition }}
        >
          <>
            {showBullet && (
              <EventBullet className="lg:hidden" color={event.color} />
            )}
            <MonthEventBadge
              className="hidden lg:flex"
              event={event}
              cellDate={startOfDay(date)}
            />
          </>
        </motion.div>
      );
    },
    [cellEvents, currentCellMonth, date]
  );

  const showMoreCount = cellEvents.length - MAX_VISIBLE_EVENTS;

  const showMobileMore = isMobile && currentMonth && showMoreCount > 0;
  const showDesktopMore = !isMobile && currentMonth && showMoreCount > 0;

  const cellContent = useMemo(
    () => (
      <motion.div
        className={cn(
          "flex h-full lg:min-h-[10rem] flex-col gap-1 border-l border-t",
          isSunday(date) && "border-l-0"
        )}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={transition}
      >
        <DroppableArea date={date} className="w-full h-full py-2">
          <motion.span
            className={cn(
              "h-6 px-1 text-xs font-semibold lg:px-2",
              !currentMonth && "opacity-20",
              isToday(date) &&
                "flex w-6 translate-x-1 items-center justify-center rounded-full bg-primary px-0 font-bold text-primary-foreground"
            )}
          >
            {day}
          </motion.span>

          <motion.div
            className={cn(
              "flex h-fit gap-1 px-2 mt-1 lg:h-[94px] lg:flex-col lg:gap-2 lg:px-0",
              !currentMonth && "opacity-50"
            )}
          >
            {(cellEvents.length === 0 && !isMobile) ? (
              <div className="w-full h-full flex justify-center items-center group">
                <AddEditEventDialog startDate={date}>
                  <Button
                    variant="ghost"
                    className="border opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <Plus className="h-4 w-4" />
                    <span className="max-sm:hidden">Add Event</span>
                  </Button>
                </AddEditEventDialog>
              </div>
            ) : (
              [0, 1, 2].map(renderEventAtPosition)
            )}
          </motion.div>

          {showMobileMore && (
            <div className="flex justify-end items-end mx-2">
              <span className="text-[0.6rem] font-semibold text-accent-foreground">
                +{showMoreCount}
              </span>
            </div>
          )}

          {showDesktopMore && (
            <motion.div
              className={cn(
                "h-4.5 px-1.5 my-2 text-end text-xs font-semibold text-muted-foreground",
                !currentMonth && "opacity-50"
              )}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, ...transition }}
            >
              <EventListDialog date={date} events={cellEvents} />
            </motion.div>
          )}
        </DroppableArea>
      </motion.div>
    ),
    [
      date,
      day,
      currentMonth,
      cellEvents,
      showMobileMore,
      showDesktopMore,
      showMoreCount,
      renderEventAtPosition,
    ]
  );

  if (isMobile && currentMonth) {
    return (
      <EventListDialog date={date} events={cellEvents}>
        {cellContent}
      </EventListDialog>
    );
  }

  return cellContent;
}
