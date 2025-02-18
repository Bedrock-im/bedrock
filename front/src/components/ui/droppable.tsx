import { useDroppable } from "@dnd-kit/core";
import React, { useEffect, useState } from "react";

const Droppable = ({ id, children }: { id: string; children: React.ReactNode }) => {
	const { setNodeRef, isOver } = useDroppable({ id });
	const [hovering, setHovering] = useState(false);

	useEffect(() => {
		setHovering(isOver);
	}, [isOver]);

	return (
		<div
			ref={setNodeRef}
			className={hovering ? "folder-hovered" : ""}
			style={{
				transition: "background-color 0.3s ease, border-color 0.3s ease",
			}}
		>
			{children}
		</div>
	);
};

export default Droppable;
