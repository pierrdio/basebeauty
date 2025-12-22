"use client";

import { useEffect } from "react";
import Contact from "@/components/Contact";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import Services from "@/components/Services";
import WorkMap from "@/components/WorkMap";

export default function Home() {
  useEffect(() => {
    // Обработка якорей при загрузке страницы
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
    <main className="mx-auto flex w-full max-w-7xl px-4 flex-col gap-4 pt-20">
      <Hero />
      <div id="portfolio">
        <Portfolio />
      </div>
      <Services />
      <WorkMap />
      <div id="contact">
        <Contact />
      </div>
    </main>
  );
}
