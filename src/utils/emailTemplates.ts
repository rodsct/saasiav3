import { PrismaClient, EmailTemplateType } from '@prisma/client';

const prisma = new PrismaClient();

// Default email template configurations
export const defaultEmailTemplates = [
  {
    type: EmailTemplateType.WELCOME_REGISTRATION,
    subject: '¡Bienvenido a {{SITE_NAME}}!',
    variables: ['USER_NAME', 'SITE_NAME', 'SITE_URL', 'VERIFICATION_URL'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00d4ff; margin: 0;">¡Bienvenido a {{SITE_NAME}}!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hola {{USER_NAME}},</h2>
          <p style="color: #666; line-height: 1.6;">
            ¡Gracias por unirte a nuestra comunidad! Tu cuenta ha sido creada exitosamente.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Ahora puedes acceder a todas las funciones de nuestra plataforma de IA y automatizaciones.
          </p>
        </div>

        {{#VERIFICATION_URL}}
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{VERIFICATION_URL}}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verificar Email
          </a>
        </div>
        {{/VERIFICATION_URL}}

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{SITE_URL}}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Comenzar Ahora
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.<br>
          <a href="{{SITE_URL}}" style="color: #00d4ff;">{{SITE_URL}}</a>
        </p>
      </div>
    `,
    textContent: `
      ¡Bienvenido a {{SITE_NAME}}!
      
      Hola {{USER_NAME}},
      
      ¡Gracias por unirte a nuestra comunidad! Tu cuenta ha sido creada exitosamente.
      
      Ahora puedes acceder a todas las funciones de nuestra plataforma de IA y automatizaciones.
      
      {{#VERIFICATION_URL}}
      Verifica tu email: {{VERIFICATION_URL}}
      {{/VERIFICATION_URL}}
      
      Comenzar: {{SITE_URL}}
      
      © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.
    `
  },
  {
    type: EmailTemplateType.EMAIL_VERIFICATION,
    subject: 'Verifica tu email - {{SITE_NAME}}',
    variables: ['USER_NAME', 'VERIFICATION_URL', 'SITE_NAME'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00d4ff; margin: 0;">Verificación de Email</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h2 style="color: #333; margin-top: 0;">Hola {{USER_NAME}},</h2>
          <p style="color: #666; line-height: 1.6;">
            Para completar tu registro en {{SITE_NAME}}, necesitamos verificar tu dirección de email.
          </p>
          <p style="color: #666; line-height: 1.6;">
            Haz clic en el botón de abajo para verificar tu cuenta:
          </p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{VERIFICATION_URL}}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Verificar Email
          </a>
        </div>

        <div style="color: #999; font-size: 14px; margin: 20px 0; padding: 15px; background: #fff3cd; border-radius: 5px;">
          <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas por seguridad.
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Si no solicitaste esta verificación, puedes ignorar este email.<br>
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.
        </p>
      </div>
    `,
    textContent: `
      Verificación de Email - {{SITE_NAME}}
      
      Hola {{USER_NAME}},
      
      Para completar tu registro en {{SITE_NAME}}, necesitamos verificar tu dirección de email.
      
      Verifica tu email: {{VERIFICATION_URL}}
      
      ⚠️ Este enlace expirará en 24 horas por seguridad.
      
      Si no solicitaste esta verificación, puedes ignorar este email.
      
      © {{CURRENT_YEAR}} {{SITE_NAME}}
    `
  },
  {
    type: EmailTemplateType.SUBSCRIPTION_ACTIVATED,
    subject: '🎉 ¡Tu suscripción {{PLAN_NAME}} está activa!',
    variables: ['USER_NAME', 'PLAN_NAME', 'PLAN_PRICE', 'SITE_NAME', 'SITE_URL'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #00d4ff; margin: 0;">🎉 ¡Suscripción Activada!</h1>
        </div>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="color: #155724; margin-top: 0;">¡Felicidades {{USER_NAME}}!</h2>
          <p style="color: #155724; line-height: 1.6;">
            Tu suscripción <strong>{{PLAN_NAME}}</strong> ha sido activada exitosamente.
          </p>
          <p style="color: #155724; line-height: 1.6;">
            <strong>Plan:</strong> {{PLAN_NAME}}<br>
            <strong>Precio:</strong> {{PLAN_PRICE}}
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">✨ Lo que incluye tu plan:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Acceso ilimitado a Aranza AI</li>
            <li>Conversaciones sin límites</li>
            <li>Historial guardado permanentemente</li>
            <li>Acceso a descargas exclusivas PRO</li>
            <li>Interfaz premium sin restricciones</li>
            <li>Soporte prioritario 24/7</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{SITE_URL}}" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Acceder a mi Cuenta PRO
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.<br>
          <a href="{{SITE_URL}}" style="color: #00d4ff;">{{SITE_URL}}</a>
        </p>
      </div>
    `,
    textContent: `
      🎉 ¡Tu suscripción {{PLAN_NAME}} está activa!
      
      ¡Felicidades {{USER_NAME}}!
      
      Tu suscripción {{PLAN_NAME}} ha sido activada exitosamente.
      
      Plan: {{PLAN_NAME}}
      Precio: {{PLAN_PRICE}}
      
      ✨ Lo que incluye tu plan:
      - Acceso ilimitado a Aranza AI
      - Conversaciones sin límites
      - Historial guardado permanentemente
      - Acceso a descargas exclusivas PRO
      - Interfaz premium sin restricciones
      - Soporte prioritario 24/7
      
      Acceder: {{SITE_URL}}
      
      © {{CURRENT_YEAR}} {{SITE_NAME}}
    `
  },
  {
    type: EmailTemplateType.SUBSCRIPTION_CANCELLED,
    subject: 'Suscripción Cancelada - {{SITE_NAME}}',
    variables: ['USER_NAME', 'PLAN_NAME', 'EXPIRATION_DATE', 'SITE_NAME', 'SITE_URL'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #dc3545; margin: 0;">Suscripción Cancelada</h1>
        </div>
        
        <div style="background: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc3545;">
          <h2 style="color: #721c24; margin-top: 0;">{{USER_NAME}},</h2>
          <p style="color: #721c24; line-height: 1.6;">
            Tu suscripción <strong>{{PLAN_NAME}}</strong> ha sido cancelada como solicitaste.
          </p>
          <p style="color: #721c24; line-height: 1.6;">
            Tu acceso PRO continuará hasta: <strong>{{EXPIRATION_DATE}}</strong>
          </p>
        </div>

        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #856404; margin-top: 0;">ℹ️ ¿Qué pasa ahora?</h3>
          <ul style="color: #856404; line-height: 1.8;">
            <li>Puedes seguir usando las funciones PRO hasta la fecha de expiración</li>
            <li>Después de esa fecha, tu cuenta volverá al plan gratuito</li>
            <li>Tus datos y conversaciones se mantendrán guardados</li>
            <li>Puedes reactivar tu suscripción cuando quieras</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{SITE_URL}}/pricing" style="display: inline-block; background: #00d4ff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Reactivar Suscripción
          </a>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Esperamos verte pronto de nuevo 💙<br>
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.
        </p>
      </div>
    `,
    textContent: `
      Suscripción Cancelada - {{SITE_NAME}}
      
      {{USER_NAME}},
      
      Tu suscripción {{PLAN_NAME}} ha sido cancelada como solicitaste.
      
      Tu acceso PRO continuará hasta: {{EXPIRATION_DATE}}
      
      ℹ️ ¿Qué pasa ahora?
      - Puedes seguir usando las funciones PRO hasta la fecha de expiración
      - Después de esa fecha, tu cuenta volverá al plan gratuito
      - Tus datos y conversaciones se mantendrán guardados
      - Puedes reactivar tu suscripción cuando quieras
      
      Reactivar: {{SITE_URL}}/pricing
      
      Esperamos verte pronto de nuevo 💙
      © {{CURRENT_YEAR}} {{SITE_NAME}}
    `
  },
  {
    type: EmailTemplateType.PAYMENT_SUCCESS,
    subject: '✅ Pago Procesado - {{SITE_NAME}}',
    variables: ['USER_NAME', 'AMOUNT', 'PLAN_NAME', 'NEXT_BILLING_DATE', 'SITE_NAME'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #28a745; margin: 0;">✅ Pago Procesado</h1>
        </div>
        
        <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
          <h2 style="color: #155724; margin-top: 0;">{{USER_NAME}},</h2>
          <p style="color: #155724; line-height: 1.6;">
            Tu pago ha sido procesado exitosamente.
          </p>
          <div style="background: white; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <strong style="color: #155724;">Detalles del Pago:</strong><br>
            Monto: <strong>{{AMOUNT}}</strong><br>
            Plan: <strong>{{PLAN_NAME}}</strong><br>
            Próximo cobro: <strong>{{NEXT_BILLING_DATE}}</strong>
          </div>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="color: #666; line-height: 1.6; margin: 0;">
            Tu suscripción se ha renovado automáticamente. Continúas teniendo acceso completo a todas las funciones PRO.
          </p>
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          Gracias por confiar en nosotros 💙<br>
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.
        </p>
      </div>
    `,
    textContent: `
      ✅ Pago Procesado - {{SITE_NAME}}
      
      {{USER_NAME}},
      
      Tu pago ha sido procesado exitosamente.
      
      Detalles del Pago:
      Monto: {{AMOUNT}}
      Plan: {{PLAN_NAME}}
      Próximo cobro: {{NEXT_BILLING_DATE}}
      
      Tu suscripción se ha renovado automáticamente. Continúas teniendo acceso completo a todas las funciones PRO.
      
      Gracias por confiar en nosotros 💙
      © {{CURRENT_YEAR}} {{SITE_NAME}}
    `
  },
  {
    type: EmailTemplateType.SUBSCRIPTION_FAILED,
    subject: '⚠️ Problema con el pago - {{SITE_NAME}}',
    variables: ['USER_NAME', 'PLAN_NAME', 'RETRY_DATE', 'SITE_NAME', 'SITE_URL'],
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; padding: 20px 0;">
          <h1 style="color: #ffc107; margin: 0;">⚠️ Problema con el Pago</h1>
        </div>
        
        <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h2 style="color: #856404; margin-top: 0;">{{USER_NAME}},</h2>
          <p style="color: #856404; line-height: 1.6;">
            No pudimos procesar el pago de tu suscripción <strong>{{PLAN_NAME}}</strong>.
          </p>
          <p style="color: #856404; line-height: 1.6;">
            Intentaremos procesar el pago nuevamente el: <strong>{{RETRY_DATE}}</strong>
          </p>
        </div>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">💳 Posibles causas:</h3>
          <ul style="color: #666; line-height: 1.8;">
            <li>Fondos insuficientes en la tarjeta</li>
            <li>Tarjeta expirada o bloqueada</li>
            <li>Problema temporal del banco</li>
            <li>Límite de gasto alcanzado</li>
          </ul>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="{{SITE_URL}}/account/billing" style="display: inline-block; background: #ffc107; color: #212529; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Actualizar Método de Pago
          </a>
        </div>

        <div style="color: #dc3545; font-size: 14px; margin: 20px 0; padding: 15px; background: #f8d7da; border-radius: 5px;">
          <strong>⚠️ Importante:</strong> Si no actualizas tu método de pago, tu suscripción será cancelada automáticamente.
        </div>

        <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
        <p style="color: #999; font-size: 12px; text-align: center;">
          © {{CURRENT_YEAR}} {{SITE_NAME}}. Todos los derechos reservados.
        </p>
      </div>
    `,
    textContent: `
      ⚠️ Problema con el Pago - {{SITE_NAME}}
      
      {{USER_NAME}},
      
      No pudimos procesar el pago de tu suscripción {{PLAN_NAME}}.
      
      Intentaremos procesar el pago nuevamente el: {{RETRY_DATE}}
      
      💳 Posibles causas:
      - Fondos insuficientes en la tarjeta
      - Tarjeta expirada o bloqueada
      - Problema temporal del banco
      - Límite de gasto alcanzado
      
      Actualizar método de pago: {{SITE_URL}}/account/billing
      
      ⚠️ Importante: Si no actualizas tu método de pago, tu suscripción será cancelada automáticamente.
      
      © {{CURRENT_YEAR}} {{SITE_NAME}}
    `
  }
];

// Initialize default email templates
export async function initializeEmailTemplates(): Promise<void> {
  try {
    console.log('🔧 Initializing email templates...');
    
    for (const template of defaultEmailTemplates) {
      // Check if template already exists
      const existingTemplate = await prisma.emailTemplate.findUnique({
        where: { type: template.type }
      });

      if (!existingTemplate) {
        await prisma.emailTemplate.create({
          data: {
            type: template.type,
            subject: template.subject,
            htmlContent: template.htmlContent,
            textContent: template.textContent,
            variables: template.variables,
            isActive: true
          }
        });
        console.log(`✅ Created template: ${template.type}`);
      } else {
        console.log(`⏭️ Template already exists: ${template.type}`);
      }
    }

    console.log('✅ Email templates initialization completed');
  } catch (error) {
    console.error('❌ Error initializing email templates:', error);
  }
}

// Clean up function
export async function closePrismaConnection(): Promise<void> {
  await prisma.$disconnect();
}