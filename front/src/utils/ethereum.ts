export const shrink_eth_address = (address: string) => {
	return `${address.slice(0, 6)}...${address.slice(-4)}`;
};
