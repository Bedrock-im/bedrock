"use client";

import JSZip from "jszip";
import { Presentation, Loader2, Pencil, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { convertFile } from "@/services/pandoc";

interface PptxPreviewProps {
	fileUrl: string;
	filename: string;
	onSave?: (newFile: File) => Promise<void>;
}

interface SlideInfo {
	index: number;
	title: string;
	content: string;
}

export default function PptxPreview({ fileUrl, filename, onSave }: PptxPreviewProps) {
	const [currentFile, setCurrentFile] = useState<File | null>(null);
	const [viewMode, setViewMode] = useState<"preview" | "edit">("preview");

	const [slides, setSlides] = useState<SlideInfo[]>([]);
	const [currentSlide, setCurrentSlide] = useState(0);
	const [markdownContent, setMarkdownContent] = useState<string>("");

	const [isLoadingFile, setIsLoadingFile] = useState(true);
	const [isConverting, setIsConverting] = useState(false);
	const [isSaving, setIsSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const init = async () => {
			try {
				setIsLoadingFile(true);
				const res = await fetch(fileUrl);
				if (!res.ok) throw new Error("Failed to fetch file");

				const blob = await res.blob();
				const file = new File([blob], filename, { type: blob.type });
				setCurrentFile(file);

				await loadSlides(file);
			} catch (error) {
				toast.error("Failed to load document");
				console.error(error);
				setError("Failed to load presentation");
			} finally {
				setIsLoadingFile(false);
			}
		};

		init();
	}, [fileUrl, filename]);

	const loadSlides = async (file: File) => {
		try {
			const arrayBuffer = await file.arrayBuffer();
			const zip = await JSZip.loadAsync(arrayBuffer);

			const slideFiles = Object.keys(zip.files).filter((name) => name.match(/^ppt\/slides\/slide\d+\.xml$/));

			if (slideFiles.length === 0) {
				throw new Error("No slides found in presentation");
			}

			const parsedSlides = await Promise.all(
				slideFiles.map(async (slidePath, index) => {
					const slideContent = await zip.files[slidePath].async("string");
					const textMatch = slideContent.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
					const texts = textMatch ? textMatch.map((match) => match.replace(/<[^>]*>/g, "").trim()).filter(Boolean) : [];
					const title = texts[0] || `Slide ${index + 1}`;
					const content = texts.slice(1).join(" ") || "No content";

					return {
						index: index + 1,
						title,
						content,
					};
				}),
			);

			setSlides(parsedSlides);
		} catch (e) {
			console.error(e);
			setError("Failed to load presentation");
		}
	};

	const handleEditClick = async () => {
		if (!currentFile) return;

		setIsConverting(true);
		try {
			const mdBlob = await convertFile(currentFile, "md");
			const mdText = await mdBlob.text();
			setMarkdownContent(mdText);
			setViewMode("edit");
		} catch (e) {
			console.error(e);
			toast.error("Could not switch to edit mode");
		} finally {
			setIsConverting(false);
		}
	};

	const handleSave = async () => {
		setIsSaving(true);
		try {
			const markdownBlob = new Blob([markdownContent], { type: "text/markdown" });
			const markdownFile = new File([markdownBlob], "source.md");

			const originalExt = filename.split(".").pop() || "pptx";
			const newPptxBlob = await convertFile(markdownFile, originalExt);
			const newPptxFile = new File([newPptxBlob], filename, {
				type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
			});

			setCurrentFile(newPptxFile);
			await loadSlides(newPptxFile);

			if (onSave) await onSave(newPptxFile);

			setViewMode("preview");
			toast.success("File saved successfully");
		} catch (e) {
			console.error(e);
			toast.error("Failed to save changes");
		} finally {
			setIsSaving(false);
		}
	};

	if (isLoadingFile) {
		return (
			<div className="flex h-64 w-full items-center justify-center border rounded-lg bg-slate-50">
				<Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
				<span className="text-muted-foreground">Loading document...</span>
			</div>
		);
	}

	if (error || slides.length === 0) {
		return (
			<div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
				<div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
					<div className="flex items-center gap-3">
						<div className="p-2 bg-blue-100 rounded-md">
							<Presentation className="h-5 w-5 text-blue-600" />
						</div>
						<div>
							<h3 className="font-medium text-sm">{filename}</h3>
							<p className="text-xs text-muted-foreground">Read-only Preview</p>
						</div>
					</div>
				</div>
				<div className="w-full flex flex-col items-center justify-center h-[600px]">
					<div className="text-center p-8">
						<Presentation className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
						<h3 className="text-lg font-semibold mb-2">PowerPoint Presentation</h3>
						<p className="text-sm text-muted-foreground mb-4">{filename}</p>
						<p className="text-sm text-muted-foreground">
							{error ||
								"Unable to preview this presentation. Please download the file to view it in Microsoft PowerPoint or another presentation application."}
						</p>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 w-full h-full max-w-4xl mx-auto">
			<div className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
				<div className="flex items-center gap-3">
					<div className="p-2 bg-blue-100 rounded-md">
						<Presentation className="h-5 w-5 text-blue-600" />
					</div>
					<div>
						<h3 className="font-medium text-sm">{filename}</h3>
						<p className="text-xs text-muted-foreground">
							{viewMode === "preview" ? "Read-only Preview" : "Markdown Editor"}
						</p>
					</div>
				</div>

				<div className="flex gap-2">
					{viewMode === "preview" ? (
						onSave && (
							<Button onClick={handleEditClick} disabled={isConverting}>
								{isConverting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Pencil className="mr-2 h-4 w-4" />}
								Edit Document
							</Button>
						)
					) : (
						<>
							<Button variant="ghost" onClick={() => setViewMode("preview")} disabled={isSaving}>
								Cancel
							</Button>
							<Button onClick={handleSave} disabled={isSaving}>
								{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
								Save Changes
							</Button>
						</>
					)}
				</div>
			</div>

			<div className="flex-1 min-h-[500px] border rounded-lg shadow-sm bg-white overflow-hidden">
				{viewMode === "preview" ? (
					<div className="p-4">
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
					</div>
				) : (
					<Textarea
						value={markdownContent}
						onChange={(e) => setMarkdownContent(e.target.value)}
						className="w-full h-full min-h-[600px] p-6 font-mono text-sm resize-none border-0 focus-visible:ring-0"
						placeholder="# Start typing..."
					/>
				)}
			</div>
		</div>
	);
}
