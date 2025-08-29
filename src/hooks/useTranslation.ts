"use client";

import { useState, useEffect } from 'react';

type Locale = 'es' | 'en';

const translations = {
  es: {
    navigation: {
      home: "Inicio",
      about: "Acerca",
      pricing: "Precios", 
      blog: "Blog",
      contact: "Contacto",
      downloads: "Descargas",
      "aranza-asistente": "Aranza Asistente Personal",
      signin: "Iniciar Sesión",
      signup: "Registrarse",
      signout: "Cerrar Sesión",
      admin: "Admin"
    },
    hero: {
      title: "Consultora de Inteligencia Artificial y Automatizaciones",
      subtitle: "Transformamos tu negocio con soluciones personalizadas de IA y automatización. Desde chatbots inteligentes hasta workflows automatizados, te ayudamos a optimizar procesos y aumentar la eficiencia operacional.",
      cta_primary: "Consulta Gratuita",
      cta_secondary: "Ver Recursos",
      tech_subtitle: "Especializados en las tecnologías más avanzadas de IA"
    },
    chatbot: {
      title: "Asistente Inteligente Aranza.IA",
      subtitle: "Tu asistente personal especializado en inteligencia artificial, automatizaciones y consultoría empresarial. Obtén respuestas expertas y soluciones personalizadas para hacer crecer tu negocio.",
      new_chat: "Nuevo chat",
      recent: "Recientes", 
      chats: "Chats",
      placeholder: "¿Cómo puedo ayudarte hoy?",
      welcome: "¡Rodrigo ha vuelto!",
      welcome_question: "¿Cómo puedo ayudarte hoy?",
      new_conversation: "Nueva conversación",
      user: "Usuario",
      pro_plan: "Plan Pro",
      quick_actions: {
        services: "Servicios",
        services_desc: "Conoce nuestros servicios de IA",
        services_question: "¿Qué servicios de IA ofrecen?",
        consulting: "Consultoría",
        consulting_desc: "Soluciones para tu empresa", 
        consulting_question: "¿Cómo pueden ayudarme con mi negocio?",
        about: "Sobre Aranza",
        about_desc: "Conoce nuestra agencia",
        about_question: "¿Qué es Aranza.io?",
        contact: "Contacto",
        contact_desc: "Ponte en contacto",
        contact_question: "¿Cómo puedo contactarlos?"
      },
      errors: {
        server_error: "Error del servidor - intenta más tarde",
        send_message: "Error al enviar mensaje",
        server_response: "Error en respuesta del servidor"
      }
    },
    downloads: {
      title: "Descargas",
      subtitle: "Explora recursos y herramientas disponibles",
      search_placeholder: "Buscar archivos...",
      download: "Descargar",
      downloads_count: "descargas",
      premium_required: "Premium",
      registration_required: "Requiere registro",
      delete_file: "Eliminar archivo",
      all_categories: "Todas las categorías",
      all_levels: "Todos los niveles",
      no_files_title: "No se encontraron archivos",
      try_other_search: "Intenta con otros términos de búsqueda",
      no_files_available: "Aún no hay archivos disponibles",
      login_required: "Iniciar Sesión Requerido",
      login_message: "Accede a tu cuenta para explorar nuestros recursos y descargas",
      registered_resources: "Recursos para usuarios registrados",
      premium_content: "Contenido premium exclusivo",
      access_levels: {
        public: "Público",
        registered: "Registrado",
        pro: "PRO",
        premium: "Premium"
      },
      errors: {
        login_required: "Necesitas iniciar sesión para ver las descargas",
        no_permission: "No tienes permisos para ver estas descargas",
        server_error: "Error del servidor - intenta más tarde",
        loading_error: "Error cargando descargas",
        server_unavailable: "Error en formato de respuesta - servidor no disponible",
        premium_required: "Necesitas una suscripción premium para descargar este archivo",
        file_not_found: "Archivo no encontrado",
        download_error: "Error al descargar archivo",
        delete_error: "Error al eliminar archivo"
      },
      success: {
        download_started: "Descarga iniciada",
        file_deleted: "Archivo eliminado"
      },
      confirm: {
        delete_file: "¿Estás seguro de que quieres eliminar este archivo?"
      }
    },
    features: {
      subtitle: "Servicios",
      title: "Soluciones Integrales de IA y Automatización",
      paragraph: "Transformamos tu empresa con tecnología de vanguardia. Desde asistentes virtuales hasta automatización completa de procesos, ofrecemos soluciones personalizadas que impulsan el crecimiento y la eficiencia.",
      items: {
        virtual_assistants: {
          title: "Asistentes Virtuales IA",
          description: "Desarrollamos chatbots inteligentes y asistentes virtuales personalizados que mejoran la atención al cliente 24/7 y automatizan consultas frecuentes.",
          button: "Ver Más"
        },
        process_automation: {
          title: "Automatización de Procesos",
          description: "Optimizamos y automatizamos procesos empresariales repetitivos, reduciendo costos operativos y aumentando la productividad de tu equipo.",
          button: "Ver Más"
        },
        data_analysis: {
          title: "Análisis de Datos e IA",
          description: "Implementamos sistemas de análisis predictivo y machine learning para extraer insights valiosos de tus datos y mejorar la toma de decisiones.",
          button: "Ver Más"
        },
        api_integration: {
          title: "Integración de APIs e IA",
          description: "Conectamos sistemas existentes con tecnologías de IA avanzadas, creando ecosistemas digitales integrados y eficientes para tu empresa.",
          button: "Ver Más"
        },
        consulting: {
          title: "Consultoría y Capacitación",
          description: "Ofrecemos asesoramiento estratégico en adopción de IA y capacitamos a tu equipo para maximizar el potencial de las nuevas tecnologías implementadas.",
          button: "Ver Más"
        },
        support: {
          title: "Soporte y Mantenimiento",
          description: "Garantizamos el funcionamiento óptimo de tus soluciones de IA con soporte técnico continuo, actualizaciones y optimizaciones constantes.",
          button: "Ver Más"
        }
      }
    },
    contact: {
      section_title: "CONTACTANOS",
      title: "Hablemos sobre tu proyecto.",
      location: {
        title: "Nuestra Ubicación",
        address: "México, Trabajamos Globalmente"
      },
      help: {
        title: "¿Cómo Podemos Ayudarte?",
        email1: "info@aranza.io",
        email2: "contacto@aranza.io"
      },
      form: {
        title: "Envíanos un Mensaje",
        name_label: "Nombre Completo*",
        name_placeholder: "Juan Pérez",
        email_label: "Correo Electrónico*",
        email_placeholder: "ejemplo@tucorreo.com",
        phone_label: "Teléfono*",
        phone_placeholder: "+52 55 1234 5678",
        message_label: "Mensaje*",
        message_placeholder: "escribe tu mensaje aquí",
        submit_button: "Enviar"
      }
    },
    about: {
      title: "Sobre Aranza.io - Agencia de Inteligencia Artificial",
      description: "Aranza.io es una agencia de inteligencia artificial fundada por Rodrigo Gtz, enfocada en brindar soluciones innovadoras de IA para empresas y emprendedores. Nuestro asistente virtual Aranza está diseñado para transformar la manera en que interactúas con la tecnología.",
      description2: "Con años de experiencia en el desarrollo de soluciones de IA, ofrecemos una plataforma completa que integra chatbots inteligentes, gestión de archivos y herramientas premium para impulsar tu negocio.",
      cta_button: "Conocer Más",
      stats: {
        years: "3+",
        years_label: "Años de",
        years_desc: "experiencia en IA"
      }
    },
    pricing: {
      subtitle: "Planes de Suscripción",
      title: "Nuestros Planes",
      paragraph: "Elige el plan que mejor se adapte a tus necesidades y comienza a transformar tu negocio con Aranza.io",
      recommended: "Recomendado",
      per_month: "Por Mes",
      features: "Features",
      activate_subscription: "Activar Suscripción PRO",
      processing: "Procesando...",
      errors: {
        payment_error: "Error en el procesamiento del pago",
        login_required: "Por favor inicia sesión para continuar",
        payment_process_error: "Error al procesar el pago. Inténtalo de nuevo."
      }
    },
    testimonials: {
      subtitle: "Testimonios",
      title: "Lo que dicen nuestros clientes",
      paragraph: "Descubre cómo Aranza.io ha transformado el negocio de nuestros clientes con soluciones de inteligencia artificial innovadoras y personalizadas."
    },
    footer: {
      description: "Agencia de Inteligencia Artificial especializada en crear experiencias digitales innovadoras con nuestro asistente Aranza.",
      about_us: "About Us",
      features: "Features", 
      our_products: "Our Products",
      useful_links: "Useful Links",
      links: {
        home: "Home",
        features: "Features",
        about: "About",
        testimonial: "Testimonial",
        how_it_works: "How it works",
        privacy_policy: "Privacy policy",
        terms_of_service: "Terms of Service",
        refund_policy: "Refund policy",
        lineicons: "LineIcons",
        nextjs_templates: "Next.js Templates",
        tailadmin: "TailAdmin",
        plainadmin: "PlainAdmin",
        faq: "FAQ",
        blogs: "Blogs",
        support: "Support"
      },
      copyright: "Designed and Developed by",
      tailgrids_link: "TailGrids and Next.js Templates"
    }
  },
  en: {
    navigation: {
      home: "Home",
      about: "About", 
      pricing: "Pricing",
      blog: "Blog",
      contact: "Contact",
      downloads: "Downloads",
      "aranza-asistente": "Aranza Personal Assistant", 
      signin: "Sign In",
      signup: "Sign Up",
      signout: "Sign Out",
      admin: "Admin"
    },
    hero: {
      title: "Artificial Intelligence and Automation Consulting",
      subtitle: "We transform your business with personalized AI and automation solutions. From intelligent chatbots to automated workflows, we help you optimize processes and increase operational efficiency.",
      cta_primary: "Free Consultation",
      cta_secondary: "View Resources", 
      tech_subtitle: "Specialized in the most advanced AI technologies"
    },
    chatbot: {
      title: "Intelligent Assistant Aranza.IA",
      subtitle: "Your personal assistant specialized in artificial intelligence, automation and business consulting. Get expert answers and personalized solutions to grow your business.",
      new_chat: "New chat",
      recent: "Recent",
      chats: "Chats", 
      placeholder: "How can I help you today?",
      welcome: "Rodrigo is back!",
      welcome_question: "How can I help you today?",
      new_conversation: "New conversation",
      user: "User",
      pro_plan: "Pro Plan",
      quick_actions: {
        services: "Services",
        services_desc: "Learn about our AI services",
        services_question: "What AI services do you offer?",
        consulting: "Consulting",
        consulting_desc: "Solutions for your business",
        consulting_question: "How can you help my business?",
        about: "About Aranza",
        about_desc: "Learn about our agency",
        about_question: "What is Aranza.io?",
        contact: "Contact",
        contact_desc: "Get in touch",
        contact_question: "How can I contact you?"
      },
      errors: {
        server_error: "Server error - try again later",
        send_message: "Error sending message",
        server_response: "Server response error"
      }
    },
    downloads: {
      title: "Downloads",
      subtitle: "Explore available resources and tools",
      search_placeholder: "Search files...",
      download: "Download",
      downloads_count: "downloads",
      premium_required: "Premium",
      registration_required: "Registration required",
      delete_file: "Delete file",
      all_categories: "All categories",
      all_levels: "All levels",
      no_files_title: "No files found",
      try_other_search: "Try other search terms",
      no_files_available: "No files available yet",
      login_required: "Login Required",
      login_message: "Access your account to explore our resources and downloads",
      registered_resources: "Resources for registered users",
      premium_content: "Exclusive premium content",
      access_levels: {
        public: "Public",
        registered: "Registered",
        pro: "PRO",
        premium: "Premium"
      },
      errors: {
        login_required: "You need to log in to view downloads",
        no_permission: "You don't have permission to view these downloads",
        server_error: "Server error - try again later",
        loading_error: "Error loading downloads",
        server_unavailable: "Response format error - server unavailable",
        premium_required: "You need a premium subscription to download this file",
        file_not_found: "File not found",
        download_error: "Error downloading file",
        delete_error: "Error deleting file"
      },
      success: {
        download_started: "Download started",
        file_deleted: "File deleted"
      },
      confirm: {
        delete_file: "Are you sure you want to delete this file?"
      }
    },
    features: {
      subtitle: "Services",
      title: "Comprehensive AI and Automation Solutions",
      paragraph: "We transform your business with cutting-edge technology. From virtual assistants to complete process automation, we offer personalized solutions that drive growth and efficiency.",
      items: {
        virtual_assistants: {
          title: "AI Virtual Assistants",
          description: "We develop intelligent chatbots and personalized virtual assistants that improve 24/7 customer service and automate frequent inquiries.",
          button: "Learn More"
        },
        process_automation: {
          title: "Process Automation",
          description: "We optimize and automate repetitive business processes, reducing operational costs and increasing your team's productivity.",
          button: "Learn More"
        },
        data_analysis: {
          title: "Data Analysis & AI",
          description: "We implement predictive analysis systems and machine learning to extract valuable insights from your data and improve decision-making.",
          button: "Learn More"
        },
        api_integration: {
          title: "API & AI Integration",
          description: "We connect existing systems with advanced AI technologies, creating integrated and efficient digital ecosystems for your company.",
          button: "Learn More"
        },
        consulting: {
          title: "Consulting & Training",
          description: "We offer strategic advice on AI adoption and train your team to maximize the potential of newly implemented technologies.",
          button: "Learn More"
        },
        support: {
          title: "Support & Maintenance",
          description: "We guarantee optimal performance of your AI solutions with continuous technical support, updates and constant optimizations.",
          button: "Learn More"
        }
      }
    },
    contact: {
      section_title: "CONTACT US",
      title: "Let's talk about your project.",
      location: {
        title: "Our Location",
        address: "Mexico, We Work Globally"
      },
      help: {
        title: "How Can We Help You?",
        email1: "info@aranza.io",
        email2: "contacto@aranza.io"
      },
      form: {
        title: "Send Us a Message",
        name_label: "Full Name*",
        name_placeholder: "John Doe",
        email_label: "Email Address*",
        email_placeholder: "example@youremail.com",
        phone_label: "Phone*",
        phone_placeholder: "+1 555 123 4567",
        message_label: "Message*",
        message_placeholder: "write your message here",
        submit_button: "Send"
      }
    },
    about: {
      title: "About Aranza.io - Artificial Intelligence Agency",
      description: "Aranza.io is an artificial intelligence agency founded by Rodrigo Gtz, focused on providing innovative AI solutions for businesses and entrepreneurs. Our virtual assistant Aranza is designed to transform the way you interact with technology.",
      description2: "With years of experience in developing AI solutions, we offer a comprehensive platform that integrates intelligent chatbots, file management and premium tools to boost your business.",
      cta_button: "Learn More",
      stats: {
        years: "3+",
        years_label: "Years of",
        years_desc: "AI experience"
      }
    },
    pricing: {
      subtitle: "Subscription Plans",
      title: "Our Plans",
      paragraph: "Choose the plan that best fits your needs and start transforming your business with Aranza.io",
      recommended: "Recommended",
      per_month: "Per Month",
      features: "Features",
      activate_subscription: "Activate PRO Subscription",
      processing: "Processing...",
      errors: {
        payment_error: "Error processing payment",
        login_required: "Please log in to continue",
        payment_process_error: "Error processing payment. Please try again."
      }
    },
    testimonials: {
      subtitle: "Testimonials",
      title: "What our clients say",
      paragraph: "Discover how Aranza.io has transformed our clients' businesses with innovative and personalized artificial intelligence solutions."
    },
    footer: {
      description: "Artificial Intelligence agency specialized in creating innovative digital experiences with our Aranza assistant.",
      about_us: "About Us",
      features: "Features",
      our_products: "Our Products", 
      useful_links: "Useful Links",
      links: {
        home: "Home",
        features: "Features",
        about: "About", 
        testimonial: "Testimonial",
        how_it_works: "How it works",
        privacy_policy: "Privacy policy",
        terms_of_service: "Terms of Service",
        refund_policy: "Refund policy",
        lineicons: "LineIcons",
        nextjs_templates: "Next.js Templates",
        tailadmin: "TailAdmin",
        plainadmin: "PlainAdmin",
        faq: "FAQ",
        blogs: "Blogs",
        support: "Support"
      },
      copyright: "Designed and Developed by",
      tailgrids_link: "TailGrids and Next.js Templates"
    }
  }
};

export function useTranslation() {
  const [locale, setLocale] = useState<Locale>('es');

  useEffect(() => {
    // Get locale from localStorage or browser
    const stored = localStorage.getItem('locale') as Locale;
    if (stored && (stored === 'es' || stored === 'en')) {
      setLocale(stored);
    } else {
      // Detect from browser
      const browserLang = navigator.language.split('-')[0] as Locale;
      setLocale(browserLang === 'en' ? 'en' : 'es');
    }
  }, []);

  const changeLocale = (newLocale: Locale) => {
    setLocale(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[locale];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, locale, changeLocale };
}