import { ArrowDown, ArrowUp } from "lucide-react";
import React from "react";

interface SortOptionProps {
	option: string;
	name: string;
	sortColumn: string;
	sortOrder: string;
	setSortColumn: (column: string) => void;
	setSortOrder: (order: string) => void;
}

export default function SortOption({
	option,
	name,
	sortColumn,
	sortOrder,
	setSortColumn,
	setSortOrder,
}: SortOptionProps) {
	const changeSort = () => {
		if (sortColumn === option) {
			setSortOrder(sortOrder === "asc" ? "desc" : "asc");
		} else {
			setSortColumn(option);
			setSortOrder("asc");
		}
	};

	const isActive = sortColumn === option;
	const ariaLabel = isActive
		? `${name}, sorted ${sortOrder === "asc" ? "ascending" : "descending"}. Click to sort ${sortOrder === "asc" ? "descending" : "ascending"}`
		: `${name}, not sorted. Click to sort ascending`;

	return (
		<button
			type="button"
			className="flex gap-2 hover:cursor-pointer hover:underline w-fit text-left font-medium"
			onClick={changeSort}
			aria-label={ariaLabel}
		>
			{name}
			{isActive && (
				<span aria-hidden="true">{sortOrder === "desc" ? <ArrowDown size={20} /> : <ArrowUp size={20} />}</span>
			)}
		</button>
	);
}
