// hCaptcha verification utility
export async function verifyCaptcha(token: string, remoteip?: string): Promise<boolean> {
  try {
    const secret = process.env.HCAPTCHA_SECRET_KEY;
    
    console.log(`🔑 hCaptcha Secret Key: ${secret ? `${secret.substring(0, 10)}...` : 'NOT SET'}`);
    
    if (!secret) {
      console.warn('⚠️ HCAPTCHA_SECRET_KEY not configured - TEMPORARILY ALLOWING FOR DEVELOPMENT');
      // TODO: Remove this temporary bypass once environment variables are configured in EasyPanel
      return true;
    }

    console.log(`🌐 Making request to hCaptcha API with token: ${token.substring(0, 20)}...`);
    
    const response = await fetch('https://hcaptcha.com/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        secret,
        response: token,
        ...(remoteip && { remoteip }),
      }),
    });

    const data = await response.json();
    console.log('🎯 hCaptcha verification response:', data);
    
    if (data.success === true) {
      console.log('✅ hCaptcha verification successful');
    } else {
      console.error('❌ hCaptcha verification failed:', data['error-codes']);
    }
    
    return data.success === true;
  } catch (error) {
    console.error('💥 Error verifying hCaptcha:', error);
    return false;
  }
}

// Alternative: Simple math captcha for development/backup
export function generateMathCaptcha(): { question: string; answer: number } {
  const num1 = Math.floor(Math.random() * 10) + 1;
  const num2 = Math.floor(Math.random() * 10) + 1;
  const operation = Math.random() > 0.5 ? '+' : '-';
  
  let question: string;
  let answer: number;
  
  if (operation === '+') {
    question = `¿Cuánto es ${num1} + ${num2}?`;
    answer = num1 + num2;
  } else {
    // Ensure no negative results
    const larger = Math.max(num1, num2);
    const smaller = Math.min(num1, num2);
    question = `¿Cuánto es ${larger} - ${smaller}?`;
    answer = larger - smaller;
  }
  
  return { question, answer };
}

export function verifyMathCaptcha(userAnswer: string, correctAnswer: number): boolean {
  const parsed = parseInt(userAnswer, 10);
  return !isNaN(parsed) && parsed === correctAnswer;
}