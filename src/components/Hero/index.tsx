"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

const Hero = () => {
  const { t } = useTranslation();
  return (
    <>
      <section
        id="home"
        className="relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#1a1a2e] to-[#16213e] pt-[120px] md:pt-[130px] lg:pt-[160px] min-h-screen flex items-center"
      >
        <div className="container">
          <div className="-mx-4 flex flex-wrap items-center">
            <div className="w-full px-4">
              <div
                className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
                data-wow-delay=".2s"
              >
                {/* AI Brain Icon */}
                <div className="mb-8 flex justify-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff] to-[#0099cc] rounded-3xl blur-xl opacity-30 animate-pulse"></div>
                    <div className="relative inline-block p-6 bg-gradient-to-br from-[#00d4ff]/20 to-[#0099cc]/20 rounded-3xl border border-[#00d4ff]/30 backdrop-blur-sm">
                      <svg className="w-16 h-16 text-[#00d4ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.1]">
                  <span className="bg-gradient-to-r from-white via-[#00d4ff] to-white bg-clip-text text-transparent">
                    Academia Aranza.io
                  </span>
                </h1>
                <p className="mx-auto mb-4 max-w-[600px] text-lg font-medium text-[#00d4ff] sm:text-xl">
                  Automatizaciones e Inteligencia Artificial para potenciar tu negocio
                </p>
                <p className="mx-auto mb-12 max-w-[700px] text-base font-medium text-gray-300 sm:text-lg sm:leading-[1.6]">
                  Academia por suscripción para agencias de IA. Accede a plantillas exclusivas, tutoriales especializados, cursos completos y Aranza IA - tu asistente personal integrado con WhatsApp.
                </p>
                <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                  <Link
                    href="/pricing"
                    className="group relative inline-flex items-center justify-center px-8 py-4 text-base font-semibold text-white rounded-xl bg-gradient-to-r from-[#00d4ff] to-[#0099cc] hover:from-[#0099cc] hover:to-[#007acc] transition-all duration-300 shadow-lg shadow-[#00d4ff]/25 hover:shadow-xl hover:shadow-[#00d4ff]/40 transform hover:scale-105"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    Acceder a la Academia
                  </Link>
                  <Link
                    href="/chatbot"
                    className="inline-flex items-center justify-center px-8 py-4 text-base font-medium text-white rounded-xl bg-[#1a1a2e]/80 border border-[#00d4ff]/30 hover:bg-[#00d4ff]/20 transition-all duration-300 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-4l-4 4z" />
                    </svg>
                    Probar Aranza IA
                  </Link>
                </div>

                {/* Tech Stack Icons */}
                <div className="mb-16">
                  <p className="mb-8 text-center text-base font-medium text-[#00d4ff]/80">
                    Tecnologías que potencian tu agencia de IA
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-2xl mx-auto">
                    {/* AI/Neural Network */}
                    <div className="group flex flex-col items-center p-4 rounded-xl bg-[#1a1a2e]/40 border border-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all duration-300">
                      <svg className="w-8 h-8 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                      </svg>
                      <span className="text-xs text-white/60 mt-2">AI</span>
                    </div>

                    {/* Automation */}
                    <div className="group flex flex-col items-center p-4 rounded-xl bg-[#1a1a2e]/40 border border-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all duration-300">
                      <svg className="w-8 h-8 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m7.5-12.99l.75-1.3m-6.063 16.658l.26-1.477m2.605-14.772l.26-1.477m0 17.726l-.26-1.477M10.698 4.614l-.26-1.477M16.5 19.794l-.75-1.299M7.5 4.205L12 12l4.5 7.795" />
                      </svg>
                      <span className="text-xs text-white/60 mt-2">Automation</span>
                    </div>

                    {/* Analytics */}
                    <div className="group flex flex-col items-center p-4 rounded-xl bg-[#1a1a2e]/40 border border-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all duration-300">
                      <svg className="w-8 h-8 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
                      </svg>
                      <span className="text-xs text-white/60 mt-2">Analytics</span>
                    </div>

                    {/* Cloud */}
                    <div className="group flex flex-col items-center p-4 rounded-xl bg-[#1a1a2e]/40 border border-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all duration-300">
                      <svg className="w-8 h-8 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                      </svg>
                      <span className="text-xs text-white/60 mt-2">Cloud</span>
                    </div>

                    {/* Consulting */}
                    <div className="group flex flex-col items-center p-4 rounded-xl bg-[#1a1a2e]/40 border border-[#00d4ff]/20 hover:border-[#00d4ff]/50 transition-all duration-300 col-span-2 sm:col-span-1">
                      <svg className="w-8 h-8 text-[#00d4ff] group-hover:scale-110 transition-transform duration-300" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                      </svg>
                      <span className="text-xs text-white/60 mt-2">Consulting</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Animated Grid */}
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-10"></div>
          
          {/* Floating Particles */}
          <div className="absolute top-20 left-10 w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse opacity-60"></div>
          <div className="absolute top-40 right-20 w-1 h-1 bg-[#00d4ff] rounded-full animate-pulse opacity-40" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-40 left-20 w-1.5 h-1.5 bg-[#00d4ff] rounded-full animate-pulse opacity-50" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 right-10 w-2 h-2 bg-[#00d4ff] rounded-full animate-pulse opacity-30" style={{animationDelay: '0.5s'}}></div>
        </div>
        
        {/* Decorative SVG Elements */}
        <div className="absolute -left-9 bottom-0 z-[-1] opacity-20">
          <svg
            width="134"
            height="106"
            viewBox="0 0 134 106"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="1.66667" cy="104" r="1.66667" transform="rotate(-90 1.66667 104)" fill="#00d4ff" />
            <circle cx="16.3333" cy="104" r="1.66667" transform="rotate(-90 16.3333 104)" fill="#00d4ff" />
            <circle cx="31" cy="104" r="1.66667" transform="rotate(-90 31 104)" fill="#00d4ff" />
            <circle cx="45.6667" cy="104" r="1.66667" transform="rotate(-90 45.6667 104)" fill="#00d4ff" />
            <circle cx="60.3333" cy="104" r="1.66667" transform="rotate(-90 60.3333 104)" fill="#00d4ff" />
            <circle cx="88.6667" cy="104" r="1.66667" transform="rotate(-90 88.6667 104)" fill="#00d4ff" />
            <circle cx="117.667" cy="104" r="1.66667" transform="rotate(-90 117.667 104)" fill="#00d4ff" />
            <circle cx="74.6667" cy="104" r="1.66667" transform="rotate(-90 74.6667 104)" fill="#00d4ff" />
            <circle cx="103" cy="104" r="1.66667" transform="rotate(-90 103 104)" fill="#00d4ff" />
            <circle cx="132" cy="104" r="1.66667" transform="rotate(-90 132 104)" fill="#00d4ff" />
            <circle cx="1.66667" cy="89.3333" r="1.66667" transform="rotate(-90 1.66667 89.3333)" fill="#00d4ff" />
            <circle cx="16.3333" cy="89.3333" r="1.66667" transform="rotate(-90 16.3333 89.3333)" fill="#00d4ff" />
            <circle cx="31" cy="89.3333" r="1.66667" transform="rotate(-90 31 89.3333)" fill="#00d4ff" />
            <circle cx="45.6667" cy="89.3333" r="1.66667" transform="rotate(-90 45.6667 89.3333)" fill="#00d4ff" />
            <circle cx="60.3333" cy="89.3338" r="1.66667" transform="rotate(-90 60.3333 89.3338)" fill="#00d4ff" />
            <circle cx="88.6667" cy="89.3338" r="1.66667" transform="rotate(-90 88.6667 89.3338)" fill="#00d4ff" />
            <circle cx="117.667" cy="89.3338" r="1.66667" transform="rotate(-90 117.667 89.3338)" fill="#00d4ff" />
            <circle cx="74.6667" cy="89.3338" r="1.66667" transform="rotate(-90 74.6667 89.3338)" fill="#00d4ff" />
            <circle cx="103" cy="89.3338" r="1.66667" transform="rotate(-90 103 89.3338)" fill="#00d4ff" />
            <circle cx="132" cy="89.3338" r="1.66667" transform="rotate(-90 132 89.3338)" fill="#00d4ff" />
          </svg>
        </div>
        
        <div className="absolute -right-6 -top-6 z-[-1]">
          <svg
            width="134"
            height="106"
            viewBox="0 0 134 106"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="1.66667" cy="104" r="1.66667" transform="rotate(-90 1.66667 104)" fill="#00d4ff" />
            <circle cx="16.3333" cy="104" r="1.66667" transform="rotate(-90 16.3333 104)" fill="#00d4ff" />
            <circle cx="31" cy="104" r="1.66667" transform="rotate(-90 31 104)" fill="#00d4ff" />
            <circle cx="45.6667" cy="104" r="1.66667" transform="rotate(-90 45.6667 104)" fill="#00d4ff" />
            <circle cx="60.3333" cy="104" r="1.66667" transform="rotate(-90 60.3333 104)" fill="#00d4ff" />
            <circle cx="88.6667" cy="104" r="1.66667" transform="rotate(-90 88.6667 104)" fill="#00d4ff" />
            <circle cx="117.667" cy="104" r="1.66667" transform="rotate(-90 117.667 104)" fill="#00d4ff" />
            <circle cx="74.6667" cy="104" r="1.66667" transform="rotate(-90 74.6667 104)" fill="#00d4ff" />
            <circle cx="103" cy="104" r="1.66667" transform="rotate(-90 103 104)" fill="#00d4ff" />
            <circle cx="132" cy="104" r="1.66667" transform="rotate(-90 132 104)" fill="#00d4ff" />
            <circle cx="1.66667" cy="89.3333" r="1.66667" transform="rotate(-90 1.66667 89.3333)" fill="#00d4ff" />
            <circle cx="16.3333" cy="89.3333" r="1.66667" transform="rotate(-90 16.3333 89.3333)" fill="#00d4ff" />
            <circle cx="31" cy="89.3333" r="1.66667" transform="rotate(-90 31 89.3333)" fill="#00d4ff" />
            <circle cx="45.6667" cy="89.3333" r="1.66667" transform="rotate(-90 45.6667 89.3333)" fill="#00d4ff" />
            <circle cx="60.3333" cy="89.3338" r="1.66667" transform="rotate(-90 60.3333 89.3338)" fill="#00d4ff" />
            <circle cx="88.6667" cy="89.3338" r="1.66667" transform="rotate(-90 88.6667 89.3338)" fill="#00d4ff" />
            <circle cx="117.667" cy="89.3338" r="1.66667" transform="rotate(-90 117.667 89.3338)" fill="#00d4ff" />
            <circle cx="74.6667" cy="89.3338" r="1.66667" transform="rotate(-90 74.6667 89.3338)" fill="#00d4ff" />
            <circle cx="103" cy="89.3338" r="1.66667" transform="rotate(-90 103 89.3338)" fill="#00d4ff" />
            <circle cx="132" cy="89.3338" r="1.66667" transform="rotate(-90 132 89.3338)" fill="#00d4ff" />
          </svg>
        </div>
      </section>
    </>
  );
};

export default Hero;