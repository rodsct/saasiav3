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
          subtitle={t('features.subtitle')}
          title={t('features.title')}
          paragraph={t('features.paragraph')}
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
