import { cva } from "class-variance-authority";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { transition } from "@/modules/components/calendar/animations";
import type { TEventColor } from "@/modules/components/calendar/types";

const eventBulletVariants = cva("size-2 rounded-full", {
	variants: {
		color: {
			School: "bg-indigo-600 dark:bg-indigo-500",
			Homework: "bg-cyan-600 dark:bg-cyan-500",
			Studying: "bg-violet-600 dark:bg-violet-500",
			Extracurriculars: "bg-green-600 dark:bg-green-500",
			Work: "bg-amber-600 dark:bg-amber-500",
			Other: "bg-slate-600 dark:bg-slate-500",
		},
	},
	defaultVariants: {
		color: "Other",
	},
});

export function EventBullet({
	color,
	className,
}: {
	color: TEventColor;
	className?: string;
}) {
	return (
		<motion.div
			className={cn(eventBulletVariants({ color, className }))}
			initial={{ scale: 0, opacity: 0 }}
			animate={{ scale: 1, opacity: 1 }}
			whileHover={{ scale: 1.2 }}
			transition={transition}
		/>
	);
}
