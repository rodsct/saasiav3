import { NextResponse } from "next/server";

export async function GET() {
  // Solo para debugging - no exponer en producción normalmente
  const envVars = {
    HCAPTCHA_SECRET_KEY: process.env.HCAPTCHA_SECRET_KEY ? "SET" : "NOT SET",
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY ? "SET" : "NOT SET",
    NODE_ENV: process.env.NODE_ENV,
    // Mostrar todas las variables que empiecen con HCAPTCHA
    allHCaptchaVars: Object.keys(process.env)
      .filter(key => key.includes('HCAPTCHA'))
      .reduce((obj, key) => {
        obj[key] = process.env[key] ? `SET (${process.env[key]?.substring(0, 10)}...)` : "NOT SET";
        return obj;
      }, {} as Record<string, string>),
    // Todas las variables de entorno disponibles (solo nombres)
    allEnvKeys: Object.keys(process.env).sort(),
  };

  return NextResponse.json(envVars);
}