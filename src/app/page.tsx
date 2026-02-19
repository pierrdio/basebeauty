"use client";

import { useEffect } from "react";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import WorkMap from "@/components/WorkMap";
import VideoSection from "@/components/Video-section";
import NewsSection from "@/components/News-section";

export default function Home() {
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const element = document.querySelector(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-20">
        <Hero />
      </main>

      {/* Общий контейнер с фоном для видео и новостей */}
      <div className="relative w-full">
        {/* Grid background с плавным затуханием */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(29,205,159,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(29,205,159,0.07) 1px, transparent 1px)",
            backgroundSize: "120px 120px",
            backgroundPosition: "center -60px",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        />

        <VideoSection />
        <NewsSection />
      </div>

      <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4">
        <div id="portfolio">
          <Portfolio />
        </div>
        <Services />
        <WorkMap />
        <div id="contact">
          <Contact />
        </div>
      </main>
    </>
  );
}
