import Hero from "@/components/sections/Hero";
import Challenge from "@/components/sections/Challenge";
import Story from "@/components/sections/Story";
import Achievements from "@/components/sections/Achievements";
import Gallery from "@/components/sections/Gallery";
import WorldRecord from "@/components/sections/WorldRecord";
import Quote from "@/components/sections/Quote";
import Sponsorship from "@/components/sections/Sponsorship";
import Ending from "@/components/sections/Ending";

export default function Home() {
  return (
    <main
      id="main-content"
      className="relative flex min-h-screen w-full flex-col bg-ink text-snow"
    >
      {/* Section 1 — Hero */}
      <Hero />

      {/* Section 2 — The Challenge */}
      <Challenge />

      {/* Section 3 — My Story */}
      <Story />

      {/* Section 4 — Achievements */}
      <Achievements />

      {/* Gallery — expedition photos */}
      <Gallery />

      {/* Section 5 — World Record Attempt */}
      <WorldRecord />

      {/* Section 6 — Quote */}
      <Quote />

      {/* Section 7 — Sponsorship */}
      <Sponsorship />

      {/* Section 8 — Final Cinematic Ending */}
      <Ending />
    </main>
  );
}
