import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useActiveAccount } from "thirdweb/react";

import { UserCredit } from "@/services/credits";

export function useCredits() {
	const account = useActiveAccount();

	const queryClient = useQueryClient();

	const {
		data: creditBalance,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["credits", account?.address],
		queryFn: async (): Promise<UserCredit> => {
			// if (!account) {
			return { balance: 0, transactions: [] };
			// }

			// const creditService = new CreditService(alephService, account.address);
			// return await creditService.getCreditBalance();
		},
		// enabled: !!alephService && !!account,
		enabled: !!account,
		staleTime: 30000, // 30 seconds
		refetchInterval: 60000, // Refetch every minute
	});

	const refreshCredits = () => {
		queryClient.invalidateQueries({ queryKey: ["credits", account?.address] });
	};

	return {
		creditBalance: creditBalance || { balance: 0, transactions: [] },
		isLoading,
		error,
		refetch,
		refreshCredits,
	};
}
