import { prisma } from "@/utils/prismaDB";
import { NextResponse } from "next/server";
import crypto from "crypto";
import { sendEmail } from "@/utils/email";
import { verifyCaptcha } from "@/utils/captcha";

export async function POST(request: Request) {
	const body = await request.json();
	const { email, hcaptchaToken } = body;

	if (!email) {
		return new NextResponse("Missing Fields", { status: 400 });
	}

	// Verify hCaptcha
	if (!hcaptchaToken) {
		return NextResponse.json({ 
			error: "Verificación CAPTCHA requerida" 
		}, { status: 400 });
	}

	const captchaValid = await verifyCaptcha(hcaptchaToken);
	if (!captchaValid) {
		return NextResponse.json({ 
			error: "Verificación CAPTCHA falló. Por favor inténtalo de nuevo." 
		}, { status: 400 });
	}

	console.log(`✅ CAPTCHA verified for password reset: ${email}`);

	const formatedEmail = email.toLowerCase();

	const user = await prisma.user.findUnique({
		where: {
			email: formatedEmail,
		},
	});

	if (!user) {
		return new NextResponse("User doesn't exist", { status: 400 });
	}

	const resetToken = crypto.randomBytes(20).toString("hex");

	const passwordResetTokenExp = new Date();
	passwordResetTokenExp.setMinutes(passwordResetTokenExp.getMinutes() + 10);

	await prisma.user.update({
		where: {
			email: formatedEmail,
		},
		data: {
			passwordResetToken: resetToken,
			passwordResetTokenExp,
		},
	});

	const resetURL = `${process.env.SITE_URL}/reset-password/${resetToken}`;

	try {
		await sendEmail({
			to: formatedEmail,
			subject: "Reset your password",
			html: ` 
      <div>
        <h1>You requested a password reset</h1>
        <p>Click the link below to reset your password</p>
        <a href="${resetURL}" target="_blank">Reset Password</a>
      </div>
      `,
		});

		return NextResponse.json("An email has been sent to your email", {
			status: 200,
		});
	} catch (error) {
		return NextResponse.json("An error has occurred. Please try again!", {
			status: 500,
		});
	}
}
