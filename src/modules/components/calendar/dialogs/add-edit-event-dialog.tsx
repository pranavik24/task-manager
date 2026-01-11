import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, format, set } from "date-fns";
import { type ReactNode, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-time-picker";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Modal,
	ModalClose,
	ModalContent,
	ModalDescription,
	ModalFooter,
	ModalHeader,
	ModalTitle,
	ModalTrigger,
} from "@/components/ui/responsive-modal";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { COLORS } from "@/modules/components/calendar/constants";
import { useCalendar } from "@/modules/components/calendar/contexts/calendar-context";
import { useDisclosure } from "@/modules/components/calendar/hooks";
import type { IEvent, ITask } from "@/modules/components/calendar/interfaces";
import {
	eventSchema,
	type TEventFormData,
} from "@/modules/components/calendar/schemas";

interface IProps {
	children: ReactNode;
	startDate?: Date;
	startTime?: { hour: number; minute: number };
	event?: IEvent;
	task?: ITask;
}

export function AddEditEventDialog({
	children,
	startDate,
	startTime,
	event,
}: IProps) {
	const { isOpen, onClose, onToggle } = useDisclosure();
	const { addEvent, updateEvent } = useCalendar();
	const isEditing = !!event;

	const initialDates = useMemo(() => {
		if (!isEditing && !event) {
			if (!startDate) {
				const now = new Date();
				return { startDate: now, endDate: addMinutes(now, 30) };
			}
			const start = startTime
				? set(new Date(startDate), {
						hours: startTime.hour,
						minutes: startTime.minute,
						seconds: 0,
					})
				: new Date(startDate);
			const end = addMinutes(start, 30);
			return { startDate: start, endDate: end };
		}

		return {
			startDate: new Date(event.startDate),
			endDate: new Date(event.endDate),
		};
	}, [startDate, startTime, event, isEditing]);

	const form = useForm<TEventFormData>({
		resolver: zodResolver(eventSchema),
		defaultValues: {
			title: event?.title ?? "",
			location: event?.location ?? "",
			description: event?.description ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
			color: event?.color ?? "blue",
		},
	});

	useEffect(() => {
		form.reset({
			title: event?.title ?? "",
			location: event?.location ?? "",
			description: event?.description ?? "",
			startDate: initialDates.startDate,
			endDate: initialDates.endDate,
			color: event?.color ?? "blue",
		});
	}, [event, initialDates, form]);

	const onSubmit = (values: TEventFormData) => {
		try {
			const formattedEvent: IEvent = {
				...values,
				startDate: format(values.startDate, "yyyy-MM-dd'T'HH:mm:ss"),
				endDate: format(values.endDate, "yyyy-MM-dd'T'HH:mm:ss"),
				id: isEditing ? event.id : Math.floor(Math.random() * 1000000),
				user: isEditing
					? event.user
					: {
							id: Math.floor(Math.random() * 1000000).toString(),
							name: "Jeraidi Yassir",
							picturePath: null,
						},
				color: values.color,
			};

			if (isEditing) {
				updateEvent(formattedEvent);
				toast.success("Event updated successfully");
			} else {
				addEvent(formattedEvent);
				toast.success("Event created successfully");
			}

			onClose();
			form.reset();
		} catch (error) {
			console.error(`Error ${isEditing ? "editing" : "adding"} event:`, error);
			toast.error(`Failed to ${isEditing ? "edit" : "add"} event`);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onToggle} modal={false}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>{isEditing ? "Edit Event" : "Add New Event"}</ModalTitle>
					<ModalDescription>
						{isEditing
							? "Modify your existing event."
							: "Create a new event for your calendar."}
					</ModalDescription>
				</ModalHeader>

				<Form {...form}>
					<form
						id="event-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel htmlFor="title" className="required">
										Title
									</FormLabel>
									<FormControl>
										<Input
											id="title"
											placeholder="Enter a title"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="location"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required" htmlFor="location">Location</FormLabel>
									<FormControl>
										<Input
											id="location"
											placeholder="Enter a location"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="startDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} />
							)}
						/>
						<FormField
							control={form.control}
							name="endDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} />
							)}
						/>
						<FormField
							control={form.control}
							name="color"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required">Category</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												className={`w-full ${
													fieldState.invalid ? "border-red-500" : ""
												}`}
											>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{COLORS.map((color) => (
													<SelectItem value={color} key={color}>
														<div className="flex items-center gap-2">
															<div
																className={`size-3.5 rounded-full bg-${color}-600 dark:bg-${color}-700`}
															/>
															{color}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel> Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter a description"
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<ModalFooter className="flex justify-end gap-2">
					<ModalClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</ModalClose>
					<Button form="event-form" type="submit">
						{isEditing ? "Save Changes" : "Create Event"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}

export function AddEditTaskDialog({
	children,
	startDate,
	startTime,
	task
}: IProps) {
	const { isOpen, onClose, onToggle } = useDisclosure();
	const { addTask, updateTask } = useCalendar();
	const isEditing = !!task;

	const initialDates = useMemo(() => {
		if (!isEditing && !task) {
			if (!startDate) {
				const now = new Date();
				return { dueDate: now };
			}
			const start = startTime
				? set(new Date(startDate), {
						hours: startTime.hour,
						minutes: startTime.minute,
						seconds: 0,
					})
				: new Date(startDate);
			return { dueDate: start };
		}

		return {
			dueDate: new Date(task.dueDate),
		};
	}, [startDate, startTime, task, isEditing]);

	// Use a flexible form type for tasks to avoid mismatched defaultValues shape
	// NOTE: We intentionally do NOT use `eventSchema` for tasks because the
	// event schema expects `startDate`/`endDate` while tasks use `dueDate`.
	const form = useForm<any>({
		defaultValues: {
			title: task?.title ?? "",
			location: task?.location ?? "",
			description: task?.description ?? "",
			dueDate: initialDates.dueDate,
			color: task?.color ?? "blue",
		},
	});

	useEffect(() => {
		form.reset({
			title: task?.title ?? "",
			location: task?.location ?? "",
			description: task?.description ?? "",
			dueDate: initialDates.dueDate,
			color: task?.color ?? "blue",
		});
	}, [task, initialDates, form]);

	const onSubmit = (values: any) => {
		try {
			const formattedTask: ITask = {
				...values,
				dueDate: format(values.dueDate, "yyyy-MM-dd'T'HH:mm:ss"),
				id: isEditing ? task.id : Math.floor(Math.random() * 1000000),
				user: isEditing
					? task.user
					: {
							id: Math.floor(Math.random() * 1000000).toString(),
							name: "Jeraidi Yassir",
							picturePath: null,
						},
				color: values.color,
			};

			if (isEditing) {
				updateTask(formattedTask);
				toast.success("Task updated successfully");
			} else {
				console.log("Task created successfully");
				addTask(formattedTask);
				toast.success("Task created successfully");
			}

			onClose();
			form.reset();
		} catch (error) {
			console.error(`Error ${isEditing ? "editing" : "adding"} task:`, error);
			toast.error(`Failed to ${isEditing ? "edit" : "add"} task`);
		}
	};

	return (
		<Modal open={isOpen} onOpenChange={onToggle} modal={false}>
			<ModalTrigger asChild>{children}</ModalTrigger>
			<ModalContent>
				<ModalHeader>
					<ModalTitle>{isEditing ? "Edit Task" : "Add New Task"}</ModalTitle>
					<ModalDescription>
						{isEditing
							? "Modify your existing task."
							: "Create a new task for your calendar."}
					</ModalDescription>
				</ModalHeader>

				<Form {...form}>
					<form
						id="task-form"
						onSubmit={form.handleSubmit(onSubmit)}
						className="grid gap-4 py-4"
					>
						<FormField
							control={form.control}
							name="title"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel htmlFor="title" className="required">
										Title
									</FormLabel>
									<FormControl>
										<Input
											id="title"
											placeholder="Enter a title"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="location"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required" htmlFor="location">Location</FormLabel>
									<FormControl>
										<Input
											id="location"
											placeholder="Enter a location"
											{...field}
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="dueDate"
							render={({ field }) => (
								<DateTimePicker form={form} field={field} />
							)}
						/>

						<FormField
							control={form.control}
							name="color"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel className="required">Category</FormLabel>
									<FormControl>
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												className={`w-full ${
													fieldState.invalid ? "border-red-500" : ""
												}`}
											>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												{COLORS.map((color) => (
													<SelectItem value={color} key={color}>
														<div className="flex items-center gap-2">
															<div
																className={`size-3.5 rounded-full bg-${color}-600 dark:bg-${color}-700`}
															/>
															{color}
														</div>
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="description"
							render={({ field, fieldState }) => (
								<FormItem>
									<FormLabel> Description</FormLabel>
									<FormControl>
										<Textarea
											{...field}
											placeholder="Enter a description"
											className={fieldState.invalid ? "border-red-500" : ""}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
				<ModalFooter className="flex justify-end gap-2">
					<ModalClose asChild>
						<Button type="button" variant="outline">
							Cancel
						</Button>
					</ModalClose>
					<Button form="task-form" type="submit">
						{isEditing ? "Save Changes" : "Create Task"}
					</Button>
				</ModalFooter>
			</ModalContent>
		</Modal>
	);
}
