module.exports = {
  globDirectory: 'public/',
  globPatterns: [
    '**/*.{svg,json,png,ico,html}'
  ],
  swDest: 'public/sw.js',
  runtimeCaching: [
    {
      urlPattern: /_next\/static\/.*/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static-assets',
        expiration: {
          maxEntries: 50,
        },
      },
    },
    {
      urlPattern: /\/api\/screen/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-screen-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 24 * 60 * 60 // 1 day
        },
      },
    }
  ]
};
