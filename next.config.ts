import type { NextConfig } from "next";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Каталог с package.json — чтобы Turbopack не искал tailwindcss в родительской папке (Desktop). */
const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  turbopack: {
    root: projectRoot,
  },
  // Большие POST (multipart) в Route Handlers: при использовании proxy в Next.js буфер по умолчанию 10MB.
  // См. https://nextjs.org/docs/app/api-reference/config/next-config-js/proxyClientMaxBodySize
  experimental: {
    proxyClientMaxBodySize: "150mb",
  },
};

export default nextConfig;
