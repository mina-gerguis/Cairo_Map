import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'دفتر',
    short_name: 'دفتر',
    description: 'دليلك الشامل للأماكن والخدمات في مصر',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0c23',
    theme_color: '#6c63ff',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  }
}
