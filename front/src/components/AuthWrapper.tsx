"use client";

import { LoaderIcon } from "lucide-react";
import { ReactNode } from "react";

import { useRequireAuth } from "@/hooks/use-auth";

type AuthWrapperProps = {
	children: ReactNode;
};

export const AuthWrapper = ({ children }: AuthWrapperProps) => {
	const { isConnected } = useRequireAuth();

	if (!isConnected) {
		return <LoaderIcon className="animate-spin m-auto h-[100vh]" />;
	}

	return <>{children}</>;
};
