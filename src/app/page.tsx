import Image from "next/image";
import React, { Suspense } from "react";
import { Calendar } from "@/modules/components/calendar/calendar";
import { CalendarSkeleton } from "@/modules/components/calendar/skeletons/calendar-skeleton";

export default function Home() {
	return (
		<main
			className="flex min-h-screen flex-col bg-cover bg-center bg-no-repeat"
			style={{ backgroundImage: "url('/octomind_website_background.png')" }}
		>
			<div className="container p-4 md:mx-auto">
				<div className="flex items-center justify-between">
					<div className="mt-4 mb-4">
						<div className="flex items-center gap-3">
							<div className="flex size-24 items-center justify-center overflow-hidden rounded-full border">
								<Image
									src="/final.OctoMind.transparent.png"
									alt="Octomind logo"
									width={96}
									height={96}
									className="size-full object-cover"
									priority
								/>
							</div>
							<div className="space-y-1 pt-2">
								<p className="text-5xl md:text-6xl font-semibold leading-tight"> Octomind Calendar </p>
								{/* <div className="text-sm text-t-secondary">
									Built with Next.js and Shadcn UI/Tailwind css by{" "}
									<Link
										href="https://github.com/yassir-jeraidi"
										target="_blank"
										className="inline-flex items-center gap-0.5 text-sm underline"
									>
										yassir-jeraidi
										<ArrowUpRight size={12} className="mx-1 text-t-tertiary" />
									</Link>
									<Link
										href="https://jeraidi.tech"
										target="_blank"
										className="block gap-0.5 text-sm underline"
									>
										<div className="inline-flex items-center underline">
											Portfolio{" "}
											<LinkIcon size={12} className="mx-1 text-t-tertiary" />
										</div>
									</Link>
								</div> */}
							</div>
						</div>
					</div>
					{/* <div>
						<Link
							href="https://github.com/yassir-jeraidi/full-calendar"
							className="flex justify-center items-center gap-2 underline"
						>
							<span className="hidden md:block">View on Github</span>
							<GithubIcon className="h-6 w-6 md:w-4 md:h-4" />
						</Link>
					</div> */}
				</div>
				<Suspense fallback={<CalendarSkeleton />}>
					<Calendar />
				</Suspense>
			</div>
		</main>
	);
}
