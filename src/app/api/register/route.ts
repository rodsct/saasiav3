import bcrypt from "bcrypt";
import { NextResponse } from "next/server";
import { prisma } from "@/utils/prismaDB";
import { sendEmailVerification } from "@/utils/emailService";
import { getSiteUrl } from "@/utils/siteConfig";
import { verifyCaptcha, verifyMathCaptcha } from "@/utils/captcha";
import crypto from "crypto";

export async function POST(request: any) {
  const body = await request.json();
  const { name, email, password, hcaptchaToken, mathCaptcha } = body;

  if (!name || !email || !password) {
    return NextResponse.json({ 
      error: "Todos los campos son requeridos" 
    }, { status: 400 });
  }

  // Verify CAPTCHA (try hCaptcha first, fallback to math captcha)
  let captchaValid = false;
  
  console.log(`🔍 CAPTCHA Debug - hcaptchaToken: ${hcaptchaToken ? 'YES' : 'NO'}, mathCaptcha: ${mathCaptcha ? 'YES' : 'NO'}`);
  console.log(`🔑 Environment - HCAPTCHA_SECRET_KEY: ${process.env.HCAPTCHA_SECRET_KEY ? 'SET' : 'NOT SET'}`);
  
  if (hcaptchaToken) {
    console.log(`🚀 Verifying hCaptcha token: ${hcaptchaToken.substring(0, 20)}...`);
    captchaValid = await verifyCaptcha(hcaptchaToken);
    console.log(`✅ hCaptcha verification result: ${captchaValid}`);
    
    if (!captchaValid) {
      console.error(`❌ hCaptcha verification failed for token: ${hcaptchaToken.substring(0, 20)}...`);
      return NextResponse.json({ 
        error: "Verificación CAPTCHA falló. Por favor inténtalo de nuevo." 
      }, { status: 400 });
    }
  } else if (mathCaptcha && mathCaptcha.answer && mathCaptcha.correctAnswer) {
    console.log(`🧮 Verifying math captcha: ${mathCaptcha.answer} === ${mathCaptcha.correctAnswer}`);
    captchaValid = verifyMathCaptcha(mathCaptcha.answer, mathCaptcha.correctAnswer);
    console.log(`✅ Math captcha verification result: ${captchaValid}`);
    
    if (!captchaValid) {
      return NextResponse.json({ 
        error: "Respuesta matemática incorrecta. Por favor inténtalo de nuevo." 
      }, { status: 400 });
    }
  } else {
    console.error(`❌ No captcha provided - hcaptchaToken: ${!!hcaptchaToken}, mathCaptcha: ${!!mathCaptcha}`);
    return NextResponse.json({ 
      error: "Verificación CAPTCHA requerida" 
    }, { status: 400 });
  }

  console.log(`✅ CAPTCHA verified for registration: ${email}`);

  const exist = await prisma.user.findUnique({
    where: {
      email: email.toLowerCase(),
    },
  });

  if (exist) {
    return NextResponse.json({ 
      error: "Ya existe una cuenta con este email" 
    }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user WITHOUT email verification initially
  const user = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      emailVerified: null, // Will be set when user verifies
    },
  });

  // Generate verification token
  const verificationToken = crypto.randomBytes(32).toString('hex');
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  // Store verification token
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token: verificationToken,
      expires,
    },
  });

  // Send verification email
  try {
    const verificationUrl = `${getSiteUrl()}/verify-email?token=${verificationToken}`;
    await sendEmailVerification(user.email, verificationUrl, user.name);
    console.log(`✅ Verification email sent to: ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send verification email to: ${user.email}`, error);
    // Don't fail registration if email fails
  }

  return NextResponse.json({
    success: true,
    message: "Cuenta creada exitosamente. Por favor revisa tu email para verificar tu cuenta.",
    requiresVerification: true
  }, { status: 200 });
}
