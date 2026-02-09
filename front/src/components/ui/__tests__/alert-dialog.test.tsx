import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from "../alert-dialog";

describe("AlertDialog", () => {
	it("opens alert dialog on trigger click", async () => {
		render(
			<AlertDialog>
				<AlertDialogTrigger>Open</AlertDialogTrigger>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Are you sure?</AlertDialogTitle>
						<AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction>Continue</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>,
		);

		expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument();

		fireEvent.click(screen.getByText("Open"));

		await waitFor(() => {
			expect(screen.getByText("Are you sure?")).toBeInTheDocument();
		});

		expect(screen.getByText("This action cannot be undone.")).toBeInTheDocument();
		expect(screen.getByText("Cancel")).toBeInTheDocument();
		expect(screen.getByText("Continue")).toBeInTheDocument();
	});
});
