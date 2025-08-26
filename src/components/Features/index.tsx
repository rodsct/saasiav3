import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <section className="pb-8 pt-20 bg-[#2f2f2f] lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
        <SectionTitle
          subtitle="Servicios"
          title="Soluciones Integrales de IA y Automatización"
          paragraph="Transformamos tu empresa con tecnología de vanguardia. Desde asistentes virtuales hasta automatización completa de procesos, ofrecemos soluciones personalizadas que impulsan el crecimiento y la eficiencia."
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
