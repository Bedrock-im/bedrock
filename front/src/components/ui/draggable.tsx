import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const Draggable = ({ id, children }: { id: string; children: React.ReactNode }) => {
	const { attributes, listeners, setNodeRef, transform } = useDraggable({
		id,
	});

	const style = {
		transform: CSS.Translate.toString(transform) || undefined,
	};

	return (
		<div ref={setNodeRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
};

export default Draggable;
