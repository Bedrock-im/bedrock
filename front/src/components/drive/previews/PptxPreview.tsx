"use client";

import { useEffect, useState } from "react";
import { Presentation, Loader2 } from "lucide-react";
import JSZip from "jszip";

interface PptxPreviewProps {
	fileUrl: string;
	filename: string;
}

interface SlideInfo {
	index: number;
	title: string;
	content: string;
}

export default function PptxPreview({ fileUrl, filename }: PptxPreviewProps) {
	const [slides, setSlides] = useState<SlideInfo[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentSlide, setCurrentSlide] = useState(0);

	useEffect(() => {
		setIsLoading(true);
		setError(null);

		// Parse PPTX file (PPTX is a ZIP archive)
		fetch(fileUrl)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => JSZip.loadAsync(arrayBuffer))
			.then((zip) => {
				// Get slide files
				const slideFiles = Object.keys(zip.files).filter((name) =>
					name.match(/^ppt\/slides\/slide\d+\.xml$/),
				);

				if (slideFiles.length === 0) {
					throw new Error("No slides found in presentation");
				}

				// Extract slide information
				return Promise.all(
					slideFiles.map(async (slidePath, index) => {
						const slideContent = await zip.files[slidePath].async("string");
						// Simple XML parsing to extract text
						const textMatch = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
						const texts = textMatch
							? textMatch.map((match) => match.replace(/<[^>]*>/g, "").trim()).filter(Boolean)
							: [];
						const title = texts[0] || `Slide ${index + 1}`;
						const content = texts.slice(1).join(" ") || "No content";

						return {
							index: index + 1,
							title,
							content,
						};
					}),
				);
			})
			.then((parsedSlides) => {
				setSlides(parsedSlides);
				setIsLoading(false);
			})
			.catch((err) => {
				console.error("Failed to parse PPTX:", err);
				setError("Failed to load presentation. Please download the file to view it.");
				setIsLoading(false);
			});
	}, [fileUrl]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
				<span className="ml-2 text-muted-foreground">Loading presentation...</span>
			</div>
		);
	}

	if (error || slides.length === 0) {
		return (
			<div className="w-full flex flex-col items-center justify-center h-[600px]">
				<div className="text-center p-8">
					<Presentation className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
					<h3 className="text-lg font-semibold mb-2">PowerPoint Presentation</h3>
					<p className="text-sm text-muted-foreground mb-4">{filename}</p>
					<p className="text-sm text-muted-foreground">
						{error || "Unable to preview this presentation. Please download the file to view it in Microsoft PowerPoint or another presentation application."}
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			{slides.length > 1 && (
				<div className="mb-4 flex gap-2 flex-wrap">
					{slides.map((slide, index) => (
						<button
							key={slide.index}
							onClick={() => setCurrentSlide(index)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								currentSlide === index
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
							}`}
						>
							Slide {slide.index}
						</button>
					))}
				</div>
			)}

			<div className="border rounded-lg bg-white p-8 min-h-[500px] flex flex-col items-center justify-center">
				<div className="w-full max-w-4xl">
					<h2 className="text-2xl font-bold mb-4">{slides[currentSlide].title}</h2>
					<div className="prose prose-lg max-w-none">
						<p className="text-muted-foreground whitespace-pre-wrap">{slides[currentSlide].content}</p>
					</div>
				</div>
			</div>

			<div className="mt-4 p-4 bg-muted rounded-lg">
				<p className="text-sm text-muted-foreground">
					This is a text-only preview. For full formatting, images, and animations, please download the file to view it in Microsoft PowerPoint or another presentation application.
				</p>
			</div>
		</div>
	);
}

