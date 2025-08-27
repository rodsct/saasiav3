"use client";
import { useTranslation } from "@/hooks/useTranslation";
import SectionTitle from "../Common/SectionTitle";
import PricingBox from "./PricingBox";
import { pricingData } from "@/stripe/pricingData";

const Pricing = () => {
  const { t } = useTranslation();
  
  return (
    <section
      id="pricing"
      className="relative z-20 overflow-hidden bg-[#2f2f2f] pb-12 pt-20 lg:pb-[90px] lg:pt-[120px]"
    >
      <div className="container">
        <div className="mb-[60px]">
          <SectionTitle
            subtitle={t('pricing.subtitle')}
            title={t('pricing.title')}
            paragraph={t('pricing.paragraph')}
            center
          />
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          {pricingData.map((product, i) => (
            <PricingBox key={i} product={product} />
          ))}     
        </div>
      </div>
    </section>
  );
};

export default Pricing;
