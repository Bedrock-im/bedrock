/** @type {import("next").NextConfig} */
const nextConfig = {
	trailingSlash: true,
	images: { unoptimized: true },
	webpack: (config, { isServer }) => {
		if (isServer) {
			// Don't bundle bedrock-ts-sdk on the server to avoid window errors
			config.externals = [...(config.externals || []), "bedrock-ts-sdk"];
		}
		return config;
	},
};

export default nextConfig;
