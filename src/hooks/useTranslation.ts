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
      chatbot: "Chatbot",
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
      chatbot: "Chatbot", 
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