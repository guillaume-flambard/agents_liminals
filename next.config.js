/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration pour le mode standalone (optimisé pour Docker)
  output: 'standalone',
  
  // Configuration des images
  images: {
    domains: ['n8n.memoapp.eu'],
    unoptimized: true, // Pour éviter les problèmes dans Docker
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'n8n.memoapp.eu',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Variables d'environnement publiques
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_N8N_URL: process.env.NEXT_PUBLIC_N8N_URL,
  },
  
  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
              "font-src 'self' fonts.gstatic.com",
              "img-src 'self' data: https:",
              "connect-src 'self' http://localhost:* https://n8n.memoapp.eu https://agents-liminals.memoapp.eu",
              "frame-ancestors 'none'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  
  // Redirection pour la compatibilité avec les anciennes URLs
  async redirects() {
    return [
      {
        source: '/accordeur.html',
        destination: '/agents/accordeur',
        permanent: true,
      },
      {
        source: '/peseur.html',
        destination: '/agents/peseur',
        permanent: true,
      },
      {
        source: '/denoueur.html',
        destination: '/agents/denoueur',
        permanent: true,
      },
      {
        source: '/evideur.html',
        destination: '/agents/evideur',
        permanent: true,
      },
      {
        source: '/habitant.html',
        destination: '/agents/habitant',
        permanent: true,
      },
      {
        source: '/observatoire.html',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configuration expérimentale
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Optimisations Next.js 15
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
};

module.exports = nextConfig;