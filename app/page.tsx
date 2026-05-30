import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/forum/Header";
import { Hero } from "@/components/forum/Hero";
import { About } from "@/components/forum/About";
import { Speakers } from "@/components/forum/Speakers";
import { Schedule } from "@/components/forum/Schedule";
import { Tickets } from "@/components/forum/Tickets";
import { Partners } from "@/components/forum/Partners";
import { Team } from "@/components/forum/Team";
import { Footer } from "@/components/forum/Footer";

export default function ForumLanding() {
  return (
    <>
      {/* Lenis smooth scroll — client-only side effect, renders nothing */}
      <SmoothScroll />

      <Header />

      <main>
        {/* 1. Hero — full-height opening screen */}
        <Hero />

        {/* 2. About — key stats & mission */}
        <About />

        {/* 3. Speakers — lineup of speakers */}
        <Speakers />

        {/* 4. Schedule — agenda / program */}
        <Schedule />

        {/* 5. Tickets — pricing tiers */}
        <Tickets />

        {/* 6. Partners — sponsor logos marquee */}
        <Partners />

        {/* 7. Team — organizing team */}
        <Team />
      </main>

      <Footer />
    </>
  );
}
