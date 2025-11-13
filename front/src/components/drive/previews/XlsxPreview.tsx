"use client";

import { useEffect, useState } from "react";
import * as XLSXLib from "xlsx";

interface XlsxPreviewProps {
	fileUrl: string;
	filename: string;
}

interface SheetData {
	name: string;
	data: string[][];
}

export default function XlsxPreview({ fileUrl }: XlsxPreviewProps) {
	const [sheets, setSheets] = useState<SheetData[]>([]);
	const [activeSheet, setActiveSheet] = useState<string>("");
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		setIsLoading(true);
		setError(null);

		fetch(fileUrl)
			.then((response) => {
				if (!response.ok) {
					throw new Error("Failed to load file");
				}
				return response.arrayBuffer();
			})
			.then((arrayBuffer) => {
				const workbook = XLSXLib.read(arrayBuffer, { type: "array" });
				const sheetData: SheetData[] = [];

				workbook.SheetNames.forEach((sheetName) => {
					const worksheet = workbook.Sheets[sheetName];
					const jsonData = XLSXLib.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
					const stringData = jsonData.map((row) => {
						if (Array.isArray(row)) {
							return row.map((cell) => String(cell ?? ""));
						}
						return [];
					}) as string[][];

					sheetData.push({
						name: sheetName,
						data: stringData,
					});
				});

				setSheets(sheetData);
				if (sheetData.length > 0) {
					setActiveSheet(sheetData[0].name);
				}
				setIsLoading(false);
			})
			.catch((err) => {
				console.error("Failed to convert XLSX:", err);
				setError(err instanceof Error ? err.message : "Failed to convert XLSX file");
				setIsLoading(false);
			});
	}, [fileUrl]);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">Converting XLSX to table...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<p className="text-destructive font-medium">Error converting XLSX</p>
					<p className="text-sm text-muted-foreground mt-2">{error}</p>
				</div>
			</div>
		);
	}

	if (sheets.length === 0) {
		return (
			<div className="flex items-center justify-center h-64">
				<p className="text-muted-foreground">No sheets found in this file</p>
			</div>
		);
	}

	const currentSheet = sheets.find((sheet) => sheet.name === activeSheet) || sheets[0];

	return (
		<div className="w-full">
			{sheets.length > 1 && (
				<div className="mb-4 flex gap-2 flex-wrap">
					{sheets.map((sheet) => (
						<button
							key={sheet.name}
							onClick={() => setActiveSheet(sheet.name)}
							className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
								activeSheet === sheet.name
									? "bg-primary text-primary-foreground"
									: "bg-secondary text-secondary-foreground hover:bg-secondary/80"
							}`}
						>
							{sheet.name}
						</button>
					))}
				</div>
			)}

			<div className="border rounded-lg">
				<table className="min-w-full border-collapse bg-white">
					<tbody>
						{currentSheet.data.map((row, rowIndex) => (
							<tr key={rowIndex} className={rowIndex === 0 ? "bg-gray-100 font-semibold" : ""}>
								{row.map((cell, cellIndex) => (
									<td key={cellIndex} className={`border px-4 py-2 text-sm ${rowIndex === 0 ? "font-semibold" : ""}`}>
										{cell || ""}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
