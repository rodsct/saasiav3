import Breadcrumb from "@/components/Common/Breadcrumb";
import Faq from "@/components/Faq";
import Pricing from "@/components/Pricing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Precios - Suscripción PRO | Aranza.io",
  description: "Activa tu suscripción PRO por $49/mes y obtén acceso ilimitado a Aranza AI, nuestro asistente de inteligencia artificial avanzado.",
};

const PricingPage = () => {
  return (
    <>
      <Breadcrumb pageName="Suscripción PRO" />
      <Pricing />
      <Faq />
    </>
  );
};

export default PricingPage;
