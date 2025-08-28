import { Feature } from "@/types/feature";

export const featuresData: Feature[] = [
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
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Plantillas Exclusivas para IA",
    paragraph: "Accede a nuestro catálogo de plantillas profesionales diseñadas específicamente para agencias de inteligencia artificial. Workflows, prompts y estructuras listas para implementar.",
    btn: "Ver Plantillas",
    btnLink: "/downloads",
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
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Cursos Especializados",
    paragraph: "Aprende las últimas técnicas y mejores prácticas en IA con nuestros cursos especializados. Desde automatizaciones básicas hasta implementaciones avanzadas de machine learning.",
    btn: "Ver Cursos",
    btnLink: "/pricing",
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
          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Aranza IA - Tu Asistente Personal",
    paragraph: "Asistente de IA integrado con WhatsApp que maneja tus eventos, recordatorios y tareas. Disponible 24/7 para optimizar tu flujo de trabajo y productividad.",
    btn: "Probar Aranza IA",
    btnLink: "/chatbot",
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
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Tutoriales Paso a Paso",
    paragraph: "Guías detalladas y tutoriales prácticos que te llevan de la mano para implementar soluciones de IA reales. Desde configuración hasta deployment en producción.",
    btn: "Ver Tutoriales",
    btnLink: "/pricing",
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
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Comunidad de Agencias IA",
    paragraph: "Conéctate con otros profesionales de la industria, comparte experiencias y colabora en proyectos. Una red exclusiva para impulsar tu crecimiento profesional.",
    btn: "Unirse",
    btnLink: "/pricing",
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
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    title: "Soporte Prioritario",
    paragraph: "Acceso directo a nuestro equipo de expertos en IA. Obtén respuestas rápidas, soluciones personalizadas y consultoría especializada para tus proyectos más desafiantes.",
    btn: "Contactar",
    btnLink: "/contact",
  },
];

// Función de compatibilidad para el sistema de traducciones existente
export const getFeaturesData = (t: (key: string) => string): Feature[] => featuresData;

export default featuresData;
