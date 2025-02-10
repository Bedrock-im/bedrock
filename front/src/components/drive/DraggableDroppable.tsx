import { useDraggable, useDroppable, DragEndEvent } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

const DraggableDroppable = ({
															id,
															children,
															onDrop
														}: {
	id: string,
	children: React.ReactNode,
	onDrop?: (event: DragEndEvent) => void
}) => {
	const { attributes, listeners, setNodeRef: setDraggableRef, transform } = useDraggable({
		id,
	});

	const { setNodeRef: setDroppableRef, isOver } = useDroppable({
		id,
	});

	const setCombinedRef = (node: HTMLElement | null) => {
		setDraggableRef(node);
		setDroppableRef(node);
	};

	const style = {
		transform: CSS.Translate.toString(transform) || undefined,
		backgroundColor: isOver ? "rgba(0, 128, 0, 0.2)" : undefined,
		transition: "background-color 0.3s ease",
	};

	return (
		<div ref={setCombinedRef} style={style} {...attributes} {...listeners}>
			{children}
		</div>
	);
};

export default DraggableDroppable;
