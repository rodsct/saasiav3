import About from "@/components/About";
import Breadcrumb from "@/components/Common/Breadcrumb";
import Team from "@/components/Team";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Sobre Nosotros | Aranza.io - Agencia de Inteligencia Artificial",
  description: "Conoce a Aranza.io y a nuestro fundador Rodrigo Gtz. Agencia especializada en soluciones de inteligencia artificial y nuestro asistente virtual Aranza.",
};

const AboutPage = () => {
  return (
    <main>
      <Breadcrumb pageName="Sobre Nosotros" />
      <About />
      <Team />
    </main>
  );
};

export default AboutPage;
