import SimpleSignUp from "@/components/Auth/SimpleSignUp";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Crear Cuenta | Aranza.io",
  description: "Crea tu cuenta en Aranza.io para acceder a nuestros servicios de inteligencia artificial.",
};

const SignupPage = () => {
  return <SimpleSignUp />;
};

export default SignupPage;
