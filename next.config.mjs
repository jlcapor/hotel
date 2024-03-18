/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                hostname: "picsum.photos"
            },
            {
                protocol: 'https',
                hostname: "utfs.io",
                port: '',
                pathname: '/**'
            }
        ]
    }
};

export default nextConfig;
