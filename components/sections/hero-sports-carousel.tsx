"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const slides = [
  {
    src: "/images/sportx-championship-collage.png",
    alt: "SportX 2026 championship collage",
  },
  {
    src: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80",
    alt: "Basketball match action",
  },
  {
    src: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=1200&q=80",
    alt: "Football on a sports field",
  },
  {
    src: "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80",
    alt: "Cricket match moment",
  },
];

export function HeroSportsCarousel() {
  const [activeSlide, setActiveSlide] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const dragStartY = useRef<number | null>(null);
  const isDragging = useRef(false);

  function showNextSlide() {
    setActiveSlide((current) => (current + 1) % slides.length);
  }

  function showPreviousSlide() {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      showNextSlide();
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    dragStartX.current = event.clientX;
    dragStartY.current = event.clientY;
    isDragging.current = true;
  }

  function handlePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging.current || dragStartX.current === null || dragStartY.current === null) {
      return;
    }

    const deltaX = event.clientX - dragStartX.current;
    const deltaY = event.clientY - dragStartY.current;
    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;

    if (Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.15) {
      return;
    }

    if (deltaX < 0) {
      showNextSlide();
    } else {
      showPreviousSlide();
    }
  }

  function handlePointerCancel() {
    dragStartX.current = null;
    dragStartY.current = null;
    isDragging.current = false;
  }

  return (
    <div
      className="relative aspect-[4/3] touch-pan-y select-none overflow-hidden bg-muted"
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onPointerLeave={handlePointerCancel}
    >
      {slides.map((slide, index) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={index === 0}
          sizes="(min-width: 1024px) 44vw, 100vw"
          className={`object-cover transition-opacity duration-700 ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-x-0 bottom-0 flex justify-center gap-2 bg-gradient-to-t from-black/45 to-transparent p-4">
        {slides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show sports image ${index + 1}`}
            aria-pressed={index === activeSlide}
            onClick={(event) => {
              event.stopPropagation();
              setActiveSlide(index);
            }}
            className={`h-2.5 rounded-full transition-all ${
              index === activeSlide ? "w-8 bg-white" : "w-2.5 bg-white/55"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
