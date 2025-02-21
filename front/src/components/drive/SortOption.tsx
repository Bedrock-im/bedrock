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

	return (
		<div className="flex gap-2 hover:cursor-pointer w-fit" onClick={changeSort}>
			{name}
			{sortColumn === option && <>{sortOrder === "desc" ? <ArrowDown size={20} /> : <ArrowUp size={20} />}</>}
		</div>
	);
}
