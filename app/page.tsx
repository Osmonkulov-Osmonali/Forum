import { SmoothScroll } from "@/components/SmoothScroll";
import { Header } from "@/components/forum/Header";
import { Hero } from "@/components/forum/Hero";
import { About } from "@/components/forum/About";
import { Speakers } from "@/components/forum/Speakers";
import { Schedule } from "@/components/forum/Schedule";
import { Registration } from "@/components/forum/Registration";
import { Footer } from "@/components/forum/Footer";

export default function ForumLanding() {
  return (
    <>
      <SmoothScroll />
      <Header />

      <main>
        <Hero />
        <About />
        <Speakers />
        <Schedule />
        <Registration />
      </main>

      <Footer />
    </>
  );
}
