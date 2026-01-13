import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Full Calendar",
	description: "Calendar page",
	authors: [
		{
			name: "Jeraidi Yassir",
			url: "https://jeraidi.tech",
		},
	],
	keywords: [
		"calendar",
		"big calendar",
		"full calendar",
		"next.js",
		"tailwind css",
		"shadcn ui",
		"events",
		"react.js",
	],
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				{children}
			</body>
		</html>
  )
}
