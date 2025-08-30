"use client";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import SocialSignIn from "../SocialSignIn";
import SwitchOption from "../SwitchOption";
import MagicLink from "../MagicLink";
import Loader from "@/components/Common/Loader";
import HCaptcha from "@/components/Common/HCaptcha";
import { getHCaptchaSiteKey, isHCaptchaConfigured } from "@/config/hcaptcha";

const Signin = () => {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);

  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
    checkboxToggle: false,
  });

  const [isPassword, setIsPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [hcaptchaToken, setHcaptchaToken] = useState<string>('');
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const hcaptchaSiteKey = getHCaptchaSiteKey();
  
  useEffect(() => {
    console.log('🔧 hCaptcha Configuration (SignIn):');
    console.log('- hCaptcha Site Key:', hcaptchaSiteKey ? `${hcaptchaSiteKey.substring(0, 10)}...` : 'NOT_SET');
    console.log('- Environment var:', process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || 'NOT_SET');
    console.log('- Using fallback:', !process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY && isHCaptchaConfigured());
    console.log('- All NEXT_PUBLIC_ vars:', Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_')));
    
    if (!isHCaptchaConfigured()) {
      console.error('❌ hCaptcha not configured!');
    } else {
      console.log('✅ hCaptcha configurado correctamente');
    }
  }, [hcaptchaSiteKey]);

  useEffect(() => {
    // Get URL search params
    const urlSearchParams = new URLSearchParams(window.location.search);
    setSearchParams(urlSearchParams);
    
    // Show success message if coming from email verification
    if (urlSearchParams.get('message') === 'email-verified') {
      toast.success('🎉 ¡Email verificado exitosamente! Ya puedes iniciar sesión.', {
        duration: 5000
      });
    }
  }, []);

  const handleHCaptchaVerify = (token: string) => {
    console.log('hCaptcha verified:', token.substring(0, 20) + '...');
    setHcaptchaToken(token);
    setCaptchaVerified(true);
  };

  const handleHCaptchaError = (error: any) => {
    console.error('hCaptcha error:', error);
    setCaptchaVerified(false);
    setHcaptchaToken('');
    toast.error("Error en la verificación hCaptcha. Por favor, recarga la página.");
  };

  const handleHCaptchaExpire = () => {
    console.log('hCaptcha expired');
    setCaptchaVerified(false);
    setHcaptchaToken('');
    toast.warning("hCaptcha expirado, por favor verifica nuevamente");
  };

  const loginUser = (e: any) => {
    e.preventDefault();

    if (!captchaVerified) {
      toast.error("Por favor completa la verificación hCaptcha");
      return;
    }

    setLoading(true);
    signIn("credentials", { ...loginData, redirect: false })
      .then((callback) => {
        if (callback?.error) {
          // Check if it's an email verification error
          if (callback.error.includes("verifica tu email") || callback.error.includes("Por favor verifica")) {
            toast.error(
              "📧 Tu cuenta no está verificada. Revisa tu email y haz clic en el enlace de verificación para activar tu cuenta.",
              { duration: 8000 }
            );
            // Show additional info in a separate toast
            setTimeout(() => {
              toast("💡 Si no encuentras el email, revisa tu carpeta de spam o intenta registrarte nuevamente.", {
                duration: 6000,
                icon: "ℹ️"
              });
            }, 1000);
          } else if (callback.error === "CredentialsSignin") {
            toast.error("Email o contraseña incorrectos");
          } else {
            toast.error(callback.error);
          }
          console.log(callback?.error);
          setLoading(false);
          return;
        }

        if (callback?.ok && !callback?.error) {
          toast.success("Inicio de sesión exitoso");
          setLoading(false);
          router.push("/");
        }
      })
      .catch((err) => {
        setLoading(false);
        console.log(err.message);
        toast.error(err.message);
        // Reset captcha on error to prevent callback issues
        setCaptchaVerified(false);
        setHcaptchaToken('');
        // Force page reload on critical errors to reset hCaptcha state
        if (err.message.includes('hCaptcha') || err.message.includes('callback')) {
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        }
      });
  };

  return (
    <section className="bg-[#F4F7FF] py-14 dark:bg-dark lg:py-20">
      <div className="container">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div
              className="wow fadeInUp relative mx-auto max-w-[525px] overflow-hidden rounded-lg bg-white px-8 py-14 text-center dark:bg-dark-2 sm:px-12 md:px-[60px]"
              data-wow-delay=".15s"
            >

              <SocialSignIn />

              <span className="z-1 relative my-8 block text-center">
                <span className="-z-1 absolute left-0 top-1/2 block h-px w-full bg-stroke dark:bg-dark-3"></span>
                <span className="text-body-secondary relative z-10 inline-block bg-white px-3 text-base dark:bg-dark-2">
                  O
                </span>
              </span>

              <SwitchOption
                isPassword={isPassword}
                setIsPassword={setIsPassword}
              />

              {isPassword ? (
                <form onSubmit={(e) => e.preventDefault()}>
                  <div className="mb-[22px]">
                    <input
                      type="email"
                      placeholder="Correo electrónico"
                      onChange={(e) =>
                        setLoginData({ ...loginData, email: e.target.value })
                      }
                      className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  <div className="mb-[22px]">
                    <input
                      type="password"
                      placeholder="Contraseña"
                      onChange={(e) =>
                        setLoginData({ ...loginData, password: e.target.value })
                      }
                      className="w-full rounded-md border border-stroke bg-transparent px-5 py-3 text-base text-dark outline-none transition placeholder:text-dark-6 focus:border-primary focus-visible:shadow-none dark:border-dark-3 dark:text-white dark:focus:border-primary"
                    />
                  </div>
                  
                  {/* hCaptcha Section */}
                  <div className="mb-6">
                    {console.log('Rendering hCaptcha with sitekey:', hcaptchaSiteKey)}
                    {isHCaptchaConfigured() ? (
                      <HCaptcha
                        sitekey={hcaptchaSiteKey}
                        onVerify={handleHCaptchaVerify}
                        onError={handleHCaptchaError}
                        onExpire={handleHCaptchaExpire}
                        onLoad={() => {
                          console.log('hCaptcha loaded successfully in SignIn');
                        }}
                        theme="light"
                        size="normal"
                      />
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-red-600 text-sm font-medium">
                          ⚠️ hCaptcha no configurado
                        </p>
                        <p className="text-red-500 text-xs mt-1">
                          NEXT_PUBLIC_HCAPTCHA_SITE_KEY no está definida en las variables de entorno
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="mb-9">
                    <button
                      onClick={loginUser}
                      type="submit"
                      disabled={!captchaVerified || loading}
                      className={`flex w-full cursor-pointer items-center justify-center rounded-md border border-primary px-5 py-3 text-base text-white transition duration-300 ease-in-out ${
                        captchaVerified && !loading
                          ? 'bg-primary hover:bg-primary/90'
                          : 'bg-gray-400 cursor-not-allowed'
                      }`}
                    >
                      Iniciar Sesión {loading && <Loader />}
                    </button>
                    {!captchaVerified && (
                      <p className="text-center text-sm text-red-500 mt-2">
                        Complete la verificación hCaptcha para continuar
                      </p>
                    )}
                  </div>
                </form>
              ) : (
                <MagicLink />
              )}


              <Link
                href="/forgot-password"
                className="mb-2 inline-block text-base text-gray-700 hover:text-[#00d4ff] hover:underline transition-all duration-200 dark:text-gray-300 dark:hover:text-[#00d4ff]"
              >
¿Olvidaste tu contraseña?
              </Link>
              <p className="text-gray-600 dark:text-gray-400 text-base">
¿Aún no tienes cuenta?{" "}
                <Link href="/signup" className="text-[#00d4ff] hover:text-[#0099cc] hover:underline font-medium transition-all duration-200">
                  Regístrate
                </Link>
              </p>

              <div>
                <span className="absolute right-1 top-1">
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 40 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="1.39737"
                      cy="38.6026"
                      r="1.39737"
                      transform="rotate(-90 1.39737 38.6026)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="1.39737"
                      cy="1.99122"
                      r="1.39737"
                      transform="rotate(-90 1.39737 1.99122)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="13.6943"
                      cy="38.6026"
                      r="1.39737"
                      transform="rotate(-90 13.6943 38.6026)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="13.6943"
                      cy="1.99122"
                      r="1.39737"
                      transform="rotate(-90 13.6943 1.99122)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="25.9911"
                      cy="38.6026"
                      r="1.39737"
                      transform="rotate(-90 25.9911 38.6026)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="25.9911"
                      cy="1.99122"
                      r="1.39737"
                      transform="rotate(-90 25.9911 1.99122)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="38.288"
                      cy="38.6026"
                      r="1.39737"
                      transform="rotate(-90 38.288 38.6026)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="38.288"
                      cy="1.99122"
                      r="1.39737"
                      transform="rotate(-90 38.288 1.99122)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="1.39737"
                      cy="26.3057"
                      r="1.39737"
                      transform="rotate(-90 1.39737 26.3057)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="13.6943"
                      cy="26.3057"
                      r="1.39737"
                      transform="rotate(-90 13.6943 26.3057)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="25.9911"
                      cy="26.3057"
                      r="1.39737"
                      transform="rotate(-90 25.9911 26.3057)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="38.288"
                      cy="26.3057"
                      r="1.39737"
                      transform="rotate(-90 38.288 26.3057)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="1.39737"
                      cy="14.0086"
                      r="1.39737"
                      transform="rotate(-90 1.39737 14.0086)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="13.6943"
                      cy="14.0086"
                      r="1.39737"
                      transform="rotate(-90 13.6943 14.0086)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="25.9911"
                      cy="14.0086"
                      r="1.39737"
                      transform="rotate(-90 25.9911 14.0086)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="38.288"
                      cy="14.0086"
                      r="1.39737"
                      transform="rotate(-90 38.288 14.0086)"
                      fill="#3056D3"
                    />
                  </svg>
                </span>
                <span className="absolute bottom-1 left-1">
                  <svg
                    width="29"
                    height="40"
                    viewBox="0 0 29 40"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle
                      cx="2.288"
                      cy="25.9912"
                      r="1.39737"
                      transform="rotate(-90 2.288 25.9912)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="14.5849"
                      cy="25.9911"
                      r="1.39737"
                      transform="rotate(-90 14.5849 25.9911)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="26.7216"
                      cy="25.9911"
                      r="1.39737"
                      transform="rotate(-90 26.7216 25.9911)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="2.288"
                      cy="13.6944"
                      r="1.39737"
                      transform="rotate(-90 2.288 13.6944)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="14.5849"
                      cy="13.6943"
                      r="1.39737"
                      transform="rotate(-90 14.5849 13.6943)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="26.7216"
                      cy="13.6943"
                      r="1.39737"
                      transform="rotate(-90 26.7216 13.6943)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="2.288"
                      cy="38.0087"
                      r="1.39737"
                      transform="rotate(-90 2.288 38.0087)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="2.288"
                      cy="1.39739"
                      r="1.39737"
                      transform="rotate(-90 2.288 1.39739)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="14.5849"
                      cy="38.0089"
                      r="1.39737"
                      transform="rotate(-90 14.5849 38.0089)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="26.7216"
                      cy="38.0089"
                      r="1.39737"
                      transform="rotate(-90 26.7216 38.0089)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="14.5849"
                      cy="1.39761"
                      r="1.39737"
                      transform="rotate(-90 14.5849 1.39761)"
                      fill="#3056D3"
                    />
                    <circle
                      cx="26.7216"
                      cy="1.39761"
                      r="1.39737"
                      transform="rotate(-90 26.7216 1.39761)"
                      fill="#3056D3"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Signin;
