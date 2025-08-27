import { useTranslation } from "@/hooks/useTranslation";
import axios from "axios";
import React, { useState } from "react";
import OfferList from "./OfferList";
import { Price } from "@/types/price";

const PricingBox = ({ product }: { product: Price }) => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // POST request
  const handleSubscription = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        "/api/payment",
        {
          priceId: product.id,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      
      if (typeof data === 'string' && data.startsWith('http')) {
        window.location.assign(data);
      } else {
        setError(t('pricing.errors.payment_error'));
      }
    } catch (error: any) {
      console.error("Payment error:", error);
      if (error.response?.status === 401) {
        setError(t('pricing.errors.login_required'));
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError(t('pricing.errors.payment_process_error'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full px-4 md:w-1/2 lg:w-1/3">
      <div
        className="relative z-10 mb-10 overflow-hidden rounded-xl bg-white px-8 py-10 shadow-[0px_0px_40px_0px_rgba(0,0,0,0.08)] dark:bg-dark-2 sm:p-12 lg:px-6 lg:py-10 xl:p-14"
        data-wow-delay=".1s"
      >
        {product.nickname === "PRO" && (
          <p className="absolute right-[-50px] top-[60px] inline-block -rotate-90 rounded-bl-md rounded-tl-md bg-gradient-to-r from-[#00d4ff] to-[#0099cc] px-5 py-2 text-base font-medium text-white">
            {t('pricing.recommended')}
          </p>
        )}
        <span className="mb-5 block text-xl font-medium text-dark dark:text-white">
          {product.nickname}
        </span>
        <h2 className="mb-11 text-4xl font-semibold text-dark dark:text-white xl:text-[42px] xl:leading-[1.21]">
          <span className="text-xl font-medium">$ </span>
          <span className="-ml-1 -tracking-[2px]">
            {(product.unit_amount / 100).toLocaleString("en-US", {
              currency: "USD",
            })}
          </span>
          <span className="text-base font-normal text-body-color dark:text-dark-6">
            {" "}
            {t('pricing.per_month')}
          </span>
        </h2>

        <div className="mb-[50px]">
          <h3 className="mb-5 text-lg font-medium text-dark dark:text-white">
            {t('pricing.features')}
          </h3>
          <div className="mb-10">
            {product?.offers.map((offer, i) => (
              <OfferList key={i} text={offer} />
            ))}
          </div>
        </div>
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div className="w-full">
          <button
            onClick={handleSubscription}
            disabled={isLoading}
            className="w-full rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0099cc] px-7 py-4 text-center text-base font-semibold text-white transition duration-300 hover:from-[#0099cc] hover:to-[#007acc] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('pricing.processing')}
              </span>
            ) : (
              t('pricing.activate_subscription')
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PricingBox;
