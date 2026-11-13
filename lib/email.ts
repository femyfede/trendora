import { SITE } from "./constants";
import type { Order } from "./types";

const EMAIL_ENABLED = process.env.EMAIL_ENABLED === "true";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

function generateOrderConfirmationEmail(order: Order): EmailTemplate {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5;">
        <strong>${item.name}</strong><br>
        <span style="color: #666; font-size: 14px;">${item.size} / ${item.color} × ${item.qty}</span>
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e5e5; text-align: right;">
        ${formatTZS(item.price * item.qty)}
      </td>
    </tr>
  `
    )
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5;">
      <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background: #141414; color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">TRENDORA</h1>
            <p style="margin: 10px 0 0; color: #999; font-size: 14px;">Order Confirmation</p>
          </div>
          <div style="padding: 30px;">
            <p style="font-size: 16px; color: #333; margin-top: 0;">Hi ${order.customer.firstName},</p>
            <p style="font-size: 15px; color: #666; line-height: 1.6;">Thank you for your order! We've received your order <strong style="color: #141414;">#${order.id}</strong> and it's being processed.</p>
            
            <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px; font-weight: 600; color: #333;">Order Summary</p>
              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #e5e5e5;">
                    <th style="padding: 12px; text-align: left; font-weight: 600; color: #666; font-size: 13px;">Item</th>
                    <th style="padding: 12px; text-align: right; font-weight: 600; color: #666; font-size: 13px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
              <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #e5e5e5;">
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span style="color: #666;">Subtotal</span>
                  <span>${formatTZS(order.subtotal)}</span>
                </div>
                ${order.discountAmount ? `
                <div style="display: flex; justify-content: space-between; margin: 5px 0; color: #141414;">
                  <span>Discount (${order.discountCode})</span>
                  <span>-${formatTZS(order.discountAmount)}</span>
                </div>` : ''}
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                  <span style="color: #666;">Shipping</span>
                  <span>${order.shippingFee === 0 ? 'Free' : formatTZS(order.shippingFee)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin: 10px 0 0; font-weight: 700; font-size: 16px; border-top: 2px solid #e5e5e5; padding-top: 10px;">
                  <span>Total</span>
                  <span>${formatTZS(order.total)}</span>
                </div>
              </div>
            </div>

            <div style="background: #fafafa; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px; font-weight: 600; color: #333;">Shipping Address</p>
              <p style="margin: 0; color: #666; line-height: 1.6; white-space: pre-line;">${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.region}
${order.customer.country}
${order.customer.phone}</p>
            </div>

            <div style="background: #f0f4f8; border-radius: 8px; padding: 20px; margin: 20px 0;">
              <p style="margin: 0 0 10px; font-weight: 600; color: #333;">What's Next?</p>
              <ul style="margin: 0; padding-left: 20px; color: #666; line-height: 1.8;">
                <li>We'll send you a confirmation when your order ships</li>
                <li>Track your order in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account" style="color: #141414;">account</a></li>
                <li>Delivery: ${order.customer.region === 'dar-es-salaam' ? '1-2 business days' : '2-5 business days'}</li>
              </ul>
            </div>

            <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">Questions? Contact us at <a href="mailto:${SITE.email}" style="color: #141414;">${SITE.email}</a> or ${SITE.phone}</p>
          </div>
          <div style="background: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #e5e5e5;">
            <p style="margin: 0; font-size: 12px; color: #999;">${SITE.name} · ${SITE.address}</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
TRENDORA - Order Confirmation

Hi ${order.customer.firstName},

Thank you for your order! We've received your order #${order.id}.

Order Summary:
${order.items.map(item => `- ${item.name} (${item.size}/${item.color}) x${item.qty} - ${formatTZS(item.price * item.qty)}`).join('\n')}

Subtotal: ${formatTZS(order.subtotal)}
${order.discountAmount ? `Discount (${order.discountCode}): -${formatTZS(order.discountAmount)}` : ''}
Shipping: ${order.shippingFee === 0 ? 'Free' : formatTZS(order.shippingFee)}
Total: ${formatTZS(order.total)}

Shipping to:
${order.customer.firstName} ${order.customer.lastName}
${order.customer.address}
${order.customer.city}, ${order.customer.region}
${order.customer.country}

We'll notify you when your order ships.
  `;

  return { subject: `Order Confirmation #${order.id} | TRENDORA`, html, text };
}

function formatTZS(amount: number): string {
  return new Intl.NumberFormat("en-TZ", { style: "currency", currency: "TZS", maximumFractionDigits: 0 }).format(amount);
}

async function sendEmail(to: string, template: EmailTemplate): Promise<boolean> {
  if (!EMAIL_ENABLED) {
    console.log("[EMAIL MOCK] Would send to:", to);
    console.log("[EMAIL MOCK] Subject:", template.subject);
    return true;
  }

  try {
    // In production, integrate with your email service (SendGrid, Resend, etc.)
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', { ... });
    // return response.ok;
    console.log("[EMAIL] Sending to:", to, "Subject:", template.subject);
    return true;
  } catch (error) {
    console.error("[EMAIL] Failed to send:", error);
    return false;
  }
}

export async function sendOrderConfirmationEmail(order: Order): Promise<void> {
  const template = generateOrderConfirmationEmail(order);
  await sendEmail(order.customer.email, template);
}

export async function sendOrderStatusUpdateEmail(order: Order): Promise<void> {
  const statusLabels: Record<string, string> = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    completed: "Delivered",
    cancelled: "Cancelled"
  };

  const template: EmailTemplate = {
    subject: `Order #${order.id} Status Update | TRENDORA`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #141414; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">TRENDORA</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p>Hi ${order.customer.firstName},</p>
          <p>Your order <strong>#${order.id}</strong> status has been updated to:</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="display: inline-block; padding: 15px 30px; background: #141414; color: white; border-radius: 8px; font-weight: 600; font-size: 18px;">
              ${statusLabels[order.status] || order.status}
            </span>
          </div>
          ${order.status === "shipped" ? `
            <p>Your order is on the way! You can track it in your <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/account">account</a>.</p>
          ` : order.status === "completed" ? `
            <p>Your order has been delivered. We hope you love your new pieces!</p>
          ` : order.status === "cancelled" ? `
            <p>Your order has been cancelled. If you have any questions, please contact us.</p>
          ` : ''}
          <p style="margin-top: 30px; font-size: 14px; color: #999;">Questions? Contact us at <a href="mailto:${SITE.email}">${SITE.email}</a></p>
        </div>
      </div>
    `,
    text: `TRENDORA - Order Status Update\n\nHi ${order.customer.firstName},\n\nYour order #${order.id} status has been updated to: ${statusLabels[order.status] || order.status}\n\n${order.status === "shipped" ? "Your order is on the way!" : order.status === "completed" ? "Your order has been delivered." : ""}\n\nQuestions? Contact us at ${SITE.email}`
  };

  await sendEmail(order.customer.email, template);
}

export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const template: EmailTemplate = {
    subject: "Welcome to TRENDORA!",
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #141414; color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
          <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 2px;">TRENDORA</h1>
        </div>
        <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <p>Hi ${name},</p>
          <p>Welcome to TRENDORA! We're excited to have you join our community of style-conscious shoppers across Tanzania.</p>
          <p>With your account, you can:</p>
          <ul style="color: #666; line-height: 1.8;">
            <li>Save items to your wishlist</li>
            <li>Track orders and view history</li>
            <li>Faster checkout with saved details</li>
            <li>Get exclusive offers and early access</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shop" style="display: inline-block; padding: 15px 30px; background: #141414; color: white; border-radius: 8px; font-weight: 600; text-decoration: none;">
              Start Shopping
            </a>
          </div>
          <p style="margin-top: 30px; font-size: 14px; color: #999;">Questions? Contact us at <a href="mailto:${SITE.email}">${SITE.email}</a></p>
        </div>
      </div>
    `,
    text: `Welcome to TRENDORA!\n\nHi ${name},\n\nWelcome to TRENDORA! We're excited to have you join our community.\n\nStart shopping: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/shop\n\nQuestions? Contact us at ${SITE.email}`
  };

  await sendEmail(email, template);
}