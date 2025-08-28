import Link from "next/link";

const CallToAction = () => {
  return (
    <section className="relative z-10 overflow-hidden bg-[#1e1e1e] py-20 lg:py-[115px]">
      <div className="container mx-auto">
        <div className="relative overflow-hidden">
          <div className="-mx-4 flex flex-wrap items-stretch">
            <div className="w-full px-4">
              <div className="mx-auto max-w-[570px] text-center">
                <h2 className="mb-2.5 text-3xl font-bold text-white md:text-[38px] md:leading-[1.44]">
                  <span>¿Listo para Transformar tu Agencia?</span>
                  <span className="text-3xl font-normal md:text-[40px]">
                    {" "}
                    Únete a la Academia{" "}
                  </span>
                </h2>
                <p className="mx-auto mb-6 max-w-[515px] text-base leading-[1.5] text-gray-300">
                  Accede a plantillas exclusivas, cursos especializados y Aranza IA. 
                  Todo lo que necesitas para escalar tu agencia con inteligencia artificial.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    href="/pricing"
                    className="inline-block rounded-md border border-transparent bg-[#00d4ff] px-7 py-3 text-base font-medium text-white transition hover:bg-[#0099cc]"
                  >
                    Ver Planes de Suscripción
                  </Link>
                  <Link
                    href="/chatbot"
                    className="inline-block rounded-md border border-[#00d4ff] bg-transparent px-7 py-3 text-base font-medium text-[#00d4ff] transition hover:bg-[#00d4ff] hover:text-white"
                  >
                    Probar Aranza IA Gratis
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <span className="absolute left-0 top-0">
          <svg
            width="495"
            height="470"
            viewBox="0 0 495 470"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="55"
              cy="442"
              r="138"
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="50"
            />
            <circle
              cx="446"
              r="39"
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="20"
            />
            <path
              d="M245.406 137.609L233.985 94.9852L276.609 106.406L245.406 137.609Z"
              stroke="white"
              strokeOpacity="0.08"
              strokeWidth="12"
            />
          </svg>
        </span>
        <span className="absolute bottom-0 right-0">
          <svg
            width="493"
            height="470"
            viewBox="0 0 493 470"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="462"
              cy="5"
              r="138"
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="50"
            />
            <circle
              cx="49"
              cy="470"
              r="39"
              stroke="white"
              strokeOpacity="0.04"
              strokeWidth="20"
            />
            <path
              d="M222.393 226.701L272.808 213.192L259.299 263.607L222.393 226.701Z"
              stroke="white"
              strokeOpacity="0.06"
              strokeWidth="13"
            />
          </svg>
        </span>
      </div>
    </section>
  );
};

export default CallToAction;
