import SignIn from "@/components/Auth/SignIn";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar Sesión | Aranza.io",
  description: "Inicia sesión en tu cuenta de Aranza.io para acceder a nuestros servicios de inteligencia artificial.",
};

const SigninPage = () => {
  return <SignIn />;
};

export default SigninPage;
