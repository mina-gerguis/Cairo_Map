'use client';

import React from 'react';
import Link from 'next/link';
import { InfiniteSlider } from './infinite-slider';
import { cn } from '@/lib/utils';

export interface DestinationItem {
  id?: string | number;
  title: string;
  subtitle?: string;
  image: string;
  href?: string;
  badge?: string;
  onClick?: () => void;
}

interface DestinationsInfiniteSliderProps {
  items?: DestinationItem[];
  duration?: number;
  durationOnHover?: number;
  gap?: number;
  className?: string;
  reverse?: boolean;
}

const DEFAULT_DESTINATIONS: DestinationItem[] = [
  {
    id: 1,
    title: 'أرض المعارض (معرض الكتاب)',
    subtitle: 'مدينة نصر • محور المشير',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80',
    badge: 'تريند',
    href: '/places/1',
  },
  {
    id: 2,
    title: 'التجمع الخامس (شارع التسعين)',
    subtitle: 'القاهرة الجديدة',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&auto=format&fit=crop&q=80',
    badge: 'حيوي',
    href: '/places/2',
  },
  {
    id: 3,
    title: 'ميدان التحرير ووسط البلد',
    subtitle: 'قلب العاصمة • المترو',
    image: 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=600&auto=format&fit=crop&q=80',
    badge: 'مركزي',
    href: '/places/3',
  },
  {
    id: 4,
    title: 'محطة قطارات الصعيد (بشتيل)',
    subtitle: 'الجيزة • السكك الحديدية',
    image: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=600&auto=format&fit=crop&q=80',
    badge: 'جديد',
    href: '/places/4',
  },
  {
    id: 5,
    title: 'مدينة الشيخ زايد و 6 أكتوبر',
    subtitle: 'الجيزة الغربية • هايبر وان',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    badge: 'سريع',
    href: '/places/5',
  },
  {
    id: 6,
    title: 'العاصمة الإدارية الجديدة',
    subtitle: 'القطار الخفيف LRT • المونوريل',
    image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=600&auto=format&fit=crop&q=80',
    badge: 'متطور',
    href: '/places/6',
  },
  {
    id: 7,
    title: 'الإسكندرية (محطة مصر)',
    subtitle: 'قطارات الوجه البحري',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80',
    badge: 'سياحي',
    href: '/places/7',
  },
];

export function DestinationsInfiniteSlider({
  items = DEFAULT_DESTINATIONS,
  duration = 35,
  durationOnHover = 90,
  gap = 20,
  className,
  reverse = false,
}: DestinationsInfiniteSliderProps) {
  return (
    <div className={cn('w-full py-4', className)}>
      <InfiniteSlider
        duration={duration}
        durationOnHover={durationOnHover}
        gap={gap}
        reverse={reverse}
        className="w-full"
      >
        {items.map((item, idx) => {
          const CardContent = (
            <div
              dir="rtl"
              className="group relative flex flex-col w-56 sm:w-64 shrink-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/80 backdrop-blur-md p-2 transition-all duration-300 hover:border-white/25 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/60 select-none text-right"
            >
              {/* Image on top */}
              <div className="relative w-full h-36 sm:h-40 rounded-xl overflow-hidden bg-zinc-900">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                {item.badge && (
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 text-xs font-semibold rounded-full bg-black/60 backdrop-blur-md text-zinc-200 border border-white/15">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Destination info underneath */}
              <div className="p-2.5 flex flex-col gap-1">
                <h3 className="text-sm sm:text-base font-bold text-zinc-100 tracking-tight line-clamp-1 group-hover:text-white transition-colors">
                  {item.title}
                </h3>
                {item.subtitle && (
                  <p className="text-xs text-zinc-400 font-medium line-clamp-1">
                    {item.subtitle}
                  </p>
                )}
              </div>
            </div>
          );

          if (item.href) {
            return (
              <Link
                key={item.id ? String(item.id) : `dest-${idx}`}
                href={item.href}
                className="block no-underline focus:outline-none"
                onClick={item.onClick}
              >
                {CardContent}
              </Link>
            );
          }

          return (
            <button
              key={item.id ? String(item.id) : `dest-${idx}`}
              type="button"
              onClick={item.onClick}
              className="block text-right bg-transparent p-0 border-0 cursor-pointer focus:outline-none"
            >
              {CardContent}
            </button>
          );
        })}
      </InfiniteSlider>
    </div>
  );
}

export default DestinationsInfiniteSlider;
