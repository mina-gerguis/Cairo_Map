import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'قريب - دليل الأماكن والخدمات',
    short_name: 'قريب',
    description: 'دليلك الشامل للأماكن والخدمات في مصر',
    start_url: '/',
    display: 'standalone',
    background_color: '#0b0f19',
    theme_color: '#6366f1',
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
