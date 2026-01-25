/** @type {import("next").NextConfig} */
const nextConfig = {
        trailingSlash: true,
        images: { unoptimized: true },
        webpack: (config, { isServer }) => {
                if (isServer) {
                        config.externals = [...(config.externals || []), "bedrock-ts-sdk"];
                }
                return config;
        },
        async headers() {
                return [
                        {
                                source: '/:path*',
                                headers: [
                                        { key: 'Access-Control-Allow-Origin', value: '*' },
                                ],
                        },
                ];
        },
};

export default nextConfig;
