"use client";

import { useTranslation } from "@/hooks/useTranslation";
import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import { getFeaturesData } from "./featuresData";

const Features = () => {
  const { t } = useTranslation();
  const featuresData = getFeaturesData(t);
  
  return (
    <section className="pb-8 pt-20 bg-[#2f2f2f] lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
        <SectionTitle
          subtitle="¿Qué incluye la academia?"
          title="Todo lo que necesitas para escalar tu agencia de IA"
          paragraph="Desde plantillas profesionales hasta Aranza IA, tu asistente personal. Una suscripción completa con acceso ilimitado a recursos premium para agencias de inteligencia artificial."
        />

        <div className="-mx-4 mt-12 flex flex-wrap lg:mt-20">
          {featuresData.map((feature, i) => (
            <SingleFeature key={i} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
