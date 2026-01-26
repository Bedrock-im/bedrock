"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableSkeletonProps {
	columns: number;
	rows?: number;
	headers?: string[];
}

export function TableSkeleton({ columns, rows = 5, headers }: Readonly<TableSkeletonProps>) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					{headers
						? headers.map((header, i) => <TableHead key={i}>{header}</TableHead>)
						: Array.from({ length: columns }).map((_, i) => (
								<TableHead key={i}>
									<Skeleton className="h-4 w-20" />
								</TableHead>
							))}
				</TableRow>
			</TableHeader>
			<TableBody>
				{Array.from({ length: rows }).map((_, rowIndex) => (
					<TableRow key={rowIndex}>
						{Array.from({ length: columns }).map((_, colIndex) => (
							<TableCell key={colIndex}>
								<Skeleton className="h-4 w-full max-w-[150px]" />
							</TableCell>
						))}
					</TableRow>
				))}
			</TableBody>
		</Table>
	);
}
