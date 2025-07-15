"use client";

import { useState } from "react";
import { toast } from "sonner";
import { base } from "thirdweb/chains";
import { PayEmbed, useActiveAccount } from "thirdweb/react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import env from "@/config/env";
import { thirdwebClient } from "@/config/thirdweb";
import { UserCredit } from "@/services/credits";

interface CreditTopUpProps {
	creditBalance: UserCredit;
	onTopUpComplete?: () => void;
}

const PAYMENT_RECEIVER_ADDRESS = "0x7569b2C9294BB79744E5d201F5fCA42Dc02d7A9f"; // TODO: Replace with actual payment receiver

export default function CreditTopUp({ creditBalance, onTopUpComplete }: CreditTopUpProps) {
	const [amount, setAmount] = useState("");
	const [showPayment, setShowPayment] = useState(false);
	const account = useActiveAccount();

	const handleShowPayment = () => {
		const dollarAmount = parseFloat(amount);
		if (!dollarAmount || dollarAmount <= 0) {
			toast.error("Please enter a valid amount");
			return;
		}
		setShowPayment(true);
	};

	const handlePaymentSuccess = () => {
		setShowPayment(false);
		setAmount("");
		onTopUpComplete?.();
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Up Credits</CardTitle>
				<CardDescription>Current Balance: {creditBalance.balance} credits</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{!showPayment ? (
					<>
						<div className="space-y-2">
							<Label htmlFor="amount">Amount (USD)</Label>
							<Input
								id="amount"
								type="number"
								placeholder="Enter amount in USD"
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								min="1"
								step="0.01"
							/>
						</div>

						<Button onClick={handleShowPayment} disabled={!amount} className="w-full">
							Continue to Payment
						</Button>
					</>
				) : (
					<div className="space-y-4">
						<div className="text-center">
							<p className="text-lg font-semibold">Pay ${amount} USD</p>
							<p className="text-sm text-muted-foreground">
								Credits will be added to your account after payment confirmation
							</p>
						</div>

						<PayEmbed
							client={thirdwebClient}
							payOptions={{
								mode: "direct_payment",
								buyWithFiat: false,
								onPurchaseSuccess: () => {
									handlePaymentSuccess();
								},
								purchaseData: {
									userAddress: account?.address,
								},
								paymentInfo: {
									chain: base,
									sellerAddress: PAYMENT_RECEIVER_ADDRESS,
									amount: amount.toString(),
									token: {
										name: "USDC",
										symbol: "USDC",
										address: env.USDC_BASE_ADDRESS,
									},
								},
							}}
						/>

						<Button variant="outline" onClick={() => setShowPayment(false)} className="w-full">
							Back
						</Button>
					</div>
				)}

				{creditBalance.transactions.length > 0 && (
					<div className="mt-6">
						<h4 className="font-semibold mb-2">Recent Transactions</h4>
						<div className="space-y-2 max-h-32 overflow-y-auto">
							{creditBalance.transactions.slice(0, 5).map((tx) => (
								<div key={tx.id} className="flex justify-between text-sm">
									<span>{tx.description}</span>
									<span className={tx.amount > 0 ? "text-green-600" : "text-red-600"}>
										{tx.amount > 0 ? "+" : ""}
										{tx.amount}
									</span>
								</div>
							))}
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
