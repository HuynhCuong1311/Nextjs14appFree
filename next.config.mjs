/** @type {import('next').NextConfig} */
const nextConfig = {
  //   reactStrictMode: false, // tắt chế độ strictmode
  images: {
    // domains: ["lh3.googleusercontent.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        port: "",
        pathname: "/my-bucket/**",
      },
    ],
  },
};

export default nextConfig;
