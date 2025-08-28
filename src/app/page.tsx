import About from "@/components/About";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import CallToAction from "@/components/CallToAction";
import Clients from "@/components/Clients";
import ScrollUp from "@/components/Common/ScrollUp";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Team from "@/components/Team";
import Testimonials from "@/components/Testimonials";
import { getAllPosts } from "@/utils/markdown";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academia Aranza.io - Automatizaciones e Inteligencia Artificial para Agencias",
  description: "Academia por suscripción para agencias de IA. Accede a plantillas, tutoriales, cursos y Aranza IA - tu asistente personal con WhatsApp. Automatizaciones e Inteligencia Artificial para potenciar tu negocio.",
};

export default function Home() {
  const posts = getAllPosts(["title", "date", "excerpt", "coverImage", "slug"]);

  return (
    <main>
      <ScrollUp />
      <Hero />
      <Features />
      <About />
      <Pricing />
      <CallToAction />
      <Testimonials />
      <Faq />
      <Contact />
    </main>
  );
}
