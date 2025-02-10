"use client";

import React from "react";

import "@/app/(drive)/drive.css";
import { useDriveStore } from "@/stores/drive";

export type DrivePageTitleProps = {
	selectedItemsCount: number;
};

export const DrivePageTitle: React.FC<DrivePageTitleProps> = ({ selectedItemsCount }) => {
	const { currentWorkingDirectory } = useDriveStore();
	return (
		<div>
			{selectedItemsCount === 0 ? (
				<div className="drive-title">
					<h1>My Drive ({currentWorkingDirectory})</h1>
				</div>
			) : (
				<div className="drive-title">
					<h1>{`${selectedItemsCount} fichier(s) sélectionné(s)`}</h1>
				</div>
			)}
		</div>
	);
};
