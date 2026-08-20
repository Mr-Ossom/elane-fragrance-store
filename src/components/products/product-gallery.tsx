"use client";

import * as React from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductImage } from "@/types";
import { cn } from "@/lib/utils";

const MAX_ZOOM = 2.2;

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [active, setActive] = React.useState(0);
  const [zoom, setZoom] = React.useState(false);
  const [zoomPos, setZoomPos] = React.useState({ x: 50, y: 50 });
  const containerRef = React.useRef<HTMLDivElement>(null);

  const slides = images.length > 0 ? images : [{ id: "default", url: "/images/products/hero.svg", alt: name, sortOrder: 0 }];

  const touchStartX = React.useRef<number | null>(null);

  function prev() {
    setZoom(false);
    setActive((a) => (a === 0 ? slides.length - 1 : a - 1));
  }
  function next() {
    setZoom(false);
    setActive((a) => (a === slides.length - 1 ? 0 : a + 1));
  }

  function handlePointerDown(e: React.PointerEvent) {
    touchStartX.current = e.clientX;
  }

  function handlePointerUp(e: React.PointerEvent) {
    if (touchStartX.current == null) return;
    const delta = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) > 48 && !zoom) {
      if (delta < 0) next();
      else prev();
    }
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!zoom || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  }

  const current = slides[active];

  return (
    <div className="space-y-3">
      <div
        ref={containerRef}
        className="group relative aspect-square overflow-hidden rounded-sm bg-secondary select-none"
        onMouseEnter={() => setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={handleMouseMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        role="region"
        aria-roledescription="carousel"
        aria-label="Product photos"
      >
        <Image
          key={current.id}
          src={current.url}
          alt={current.alt || name}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          priority
          className={cn(
            "object-cover transition-transform duration-200",
            zoom && "cursor-zoom-out"
          )}
          style={
            zoom
              ? {
                  transform: `scale(${MAX_ZOOM})`,
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                }
              : undefined
          }
          draggable={false}
        />

        {slides.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              onClick={prev}
              className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next image"
              onClick={next}
              className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/85 text-foreground opacity-0 shadow-md backdrop-blur-sm transition-opacity group-hover:opacity-100"
            >
              <ChevronRight size={18} />
            </button>
            <div className="absolute bottom-3 right-3 rounded-full bg-charcoal-deep/55 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm">
              {active + 1} / {slides.length}
            </div>
            {zoom && (
              <span className="absolute bottom-3 left-3 rounded-full bg-charcoal-deep/55 px-2.5 py-1 text-[11px] font-medium text-ivory backdrop-blur-sm">
                Hover to zoom
              </span>
            )}
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              aria-label={`View image ${index + 1}`}
              aria-current={index === active}
              onClick={() => {
                setZoom(false);
                setActive(index);
              }}
              className={cn(
                "relative aspect-square overflow-hidden rounded-sm border bg-secondary transition-colors",
                index === active ? "border-champagne" : "border-transparent opacity-70 hover:opacity-100"
              )}
            >
              <Image src={slide.url} alt={slide.alt || `${name} ${index + 1}`} fill sizes="100px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}