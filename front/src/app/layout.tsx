import { type Metadata } from "next";
import localFont from "next/font/local";
import { ReactNode } from "react";

import "./globals.css";

import { Toaster } from "@/components/ui/sonner";
import { Providers } from "@/layouts/providers";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Bedrock",
	description: "Your private workspace by design, not by promise.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode;
}>) {
	return (
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Providers>{children}</Providers>
				<Toaster richColors />
			</body>
		</html>
	);
}
