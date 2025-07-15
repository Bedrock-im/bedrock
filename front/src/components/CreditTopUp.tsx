"use client";

import { CheckCircle } from "lucide-react";
import { useState } from "react";
import { base } from "thirdweb/chains";
import { PayEmbed, useActiveAccount } from "thirdweb/react";

import { addCreditsRouteCreditsAddPost } from "@/apis/usernames";
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

const PAYMENT_RECEIVER_ADDRESS = "0x7Ab98f6b22ECb42E27Dc9C7d2d488F69b5CDD0b2"; // TODO: Replace with actual payment receiver

export default function CreditTopUp({ creditBalance, onTopUpComplete }: CreditTopUpProps) {
	const [amount, setAmount] = useState("");
	const [showPayment, setShowPayment] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);
	const account = useActiveAccount();

	const handleShowPayment = () => {
		const dollarAmount = parseFloat(amount);
		if (!dollarAmount || dollarAmount <= 0) {
			alert("Please enter a valid amount");
			return;
		}
		setShowPayment(true);
	};

	const handlePaymentSuccess = async () => {
		if (!account?.address) return;

		setIsProcessing(true);
		try {
			// Call backend to add credits
			await addCreditsRouteCreditsAddPost({
				body: {
					address: account.address,
					amount: parseFloat(amount),
				},
			});

			setShowPayment(false);
			setShowSuccess(true);
			onTopUpComplete?.();
		} catch (error) {
			console.error("Failed to add credits:", error);
			alert("Failed to add credits. Please contact support.");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleStartOver = () => {
		setShowSuccess(false);
		setAmount("");
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Top Up Credits</CardTitle>
				<CardDescription>Current Balance: {creditBalance.balance} credits</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				{showSuccess ? (
					<div className="text-center space-y-4">
						<CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
						<div>
							<h3 className="text-lg font-semibold text-green-600">Payment Successful!</h3>
							<p className="text-sm text-muted-foreground">
								${amount} worth of credits have been added to your account.
							</p>
						</div>
						<Button onClick={handleStartOver} className="w-full">
							Top Up Again
						</Button>
					</div>
				) : !showPayment ? (
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

						<Button variant="outline" onClick={() => setShowPayment(false)} className="w-full" disabled={isProcessing}>
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
