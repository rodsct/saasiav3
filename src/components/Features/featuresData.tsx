import { Feature } from "@/types/feature";

export const getFeaturesData = (t: (key: string) => string): Feature[] => [
  {
    id: 1,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: t('features.items.virtual_assistants.title'),
    paragraph: t('features.items.virtual_assistants.description'),
    btn: t('features.items.virtual_assistants.button'),
    btnLink: "/chatbot",
  },
  {
    id: 2,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: t('features.items.process_automation.title'),
    paragraph: t('features.items.process_automation.description'),
    btn: t('features.items.process_automation.button'),
    btnLink: "/contact",
  },
  {
    id: 3,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"
          fill="white"
        />
      </svg>
    ),
    title: t('features.items.data_analysis.title'),
    paragraph: t('features.items.data_analysis.description'),
    btn: t('features.items.data_analysis.button'),
    btnLink: "/contact",
  },
  {
    id: 4,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z"
          fill="white"
        />
      </svg>
    ),
    title: t('features.items.api_integration.title'),
    paragraph: t('features.items.api_integration.description'),
    btn: t('features.items.api_integration.button'),
    btnLink: "/contact",
  },
  {
    id: 5,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
          fill="white"
        />
      </svg>
    ),
    title: t('features.items.consulting.title'),
    paragraph: t('features.items.consulting.description'),
    btn: t('features.items.consulting.button'),
    btnLink: "/contact",
  },
  {
    id: 6,
    icon: (
      <svg
        width="35"
        height="35"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: t('features.items.support.title'),
    paragraph: t('features.items.support.description'),
    btn: t('features.items.support.button'),
    btnLink: "/contact",
  },
];

const featuresData: Feature[] = [];
export default featuresData;
