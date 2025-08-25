import SectionTitle from "../Common/SectionTitle";
import SingleFeature from "./SingleFeature";
import featuresData from "./featuresData";

const Features = () => {
  return (
    <section className="pb-8 pt-20 bg-[#2f2f2f] lg:pb-[70px] lg:pt-[120px]">
      <div className="container">
        <SectionTitle
          subtitle="Características"
          title="Potencia de Aranza.io"
          paragraph="Descubre las características que hacen de Aranza.io la plataforma de IA más completa para tu negocio."
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
