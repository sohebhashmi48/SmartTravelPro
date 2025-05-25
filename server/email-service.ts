import * as nodemailer from 'nodemailer';
import type { Deal } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailService {
  private transporter: nodemailer.Transporter | null = null;

  constructor() {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    try {
      // Gmail SMTP configuration
      const config: EmailConfig = {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.GMAIL_USER || '',
          pass: process.env.GMAIL_APP_PASSWORD || '', // Use App Password, not regular password
        },
      };

      console.log('Initializing email service...');
      console.log('Gmail User:', config.auth.user ? 'Set' : 'Not set');
      console.log('Gmail App Password:', config.auth.pass ? 'Set' : 'Not set');

      // Only create transporter if credentials are provided
      if (config.auth.user && config.auth.pass) {
        this.transporter = nodemailer.createTransport(config);
        console.log('✅ Email service initialized with Gmail SMTP');

        // Test the connection
        this.transporter.verify((error, success) => {
          if (error) {
            console.error('❌ Gmail SMTP connection failed:', error);
          } else {
            console.log('✅ Gmail SMTP connection verified successfully');
          }
        });
      } else {
        console.log('⚠️ Email credentials not found. Email service will use mock mode.');
        console.log('To enable real emails, set GMAIL_USER and GMAIL_APP_PASSWORD in your .env file');
      }
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error);
    }
  }

  async sendDealsEmail(email: string, deals: Deal[], tripDetails?: any): Promise<boolean> {
    try {
      console.log(`📧 Attempting to send deals email to: ${email}`);
      console.log(`📦 Number of deals: ${deals.length}`);
      console.log(`🏖️ Trip destination: ${tripDetails?.destination || 'Unknown'}`);

      if (!this.transporter) {
        console.log(`📧 Mock email sent to ${email} with ${deals.length} deals`);
        console.log('⚠️ To send real emails, configure Gmail SMTP in .env file');
        return true; // Mock success for development
      }

      const htmlContent = this.generateDealsEmailHTML(deals, tripDetails);
      const textContent = this.generateDealsEmailText(deals, tripDetails);

      const mailOptions = {
        from: `"SmartTravel Pro" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `🌟 Your Top 3 AI-Curated Travel Deals for ${tripDetails?.destination || 'Your Trip'}`,
        text: textContent,
        html: htmlContent,
      };

      console.log(`📤 Sending email from: ${mailOptions.from}`);
      console.log(`📬 Sending email to: ${mailOptions.to}`);
      console.log(`📝 Email subject: ${mailOptions.subject}`);

      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('📧 Message ID:', result.messageId);
      console.log('📨 Response:', result.response);
      return true;
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      console.error('Error details:', error);
      return false;
    }
  }

  async sendSingleDealEmail(email: string, deal: Deal): Promise<boolean> {
    try {
      if (!this.transporter) {
        console.log(`Mock email sent to ${email} for deal ${deal.id}`);
        return true; // Mock success for development
      }

      const htmlContent = this.generateSingleDealEmailHTML(deal);
      const textContent = this.generateSingleDealEmailText(deal);

      const mailOptions = {
        from: `"SmartTravel Pro" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: `🎯 Exclusive Travel Deal: ${deal.destination} from ${deal.agent}`,
        text: textContent,
        html: htmlContent,
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Single deal email sent successfully:', result.messageId);
      return true;
    } catch (error) {
      console.error('Failed to send single deal email:', error);
      return false;
    }
  }

  private generateDealsEmailHTML(deals: Deal[], tripDetails?: any): string {
    const savings = deals.map(deal =>
      ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0)
    );

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Your AI-Curated Travel Deals</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; }
        .content { padding: 30px; }
        .deal-card { border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 25px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .deal-header { background-color: #f8fafc; padding: 20px; border-bottom: 1px solid #e2e8f0; }
        .agent-badge { display: inline-block; background-color: #667eea; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-bottom: 10px; }
        .deal-title { font-size: 20px; font-weight: bold; color: #1a202c; margin: 0; }
        .deal-body { padding: 20px; }
        .price-section { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
        .current-price { font-size: 24px; font-weight: bold; color: #059669; }
        .original-price { font-size: 16px; color: #6b7280; text-decoration: line-through; }
        .savings { background-color: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 6px; font-size: 12px; font-weight: bold; }
        .rating { color: #fbbf24; margin-bottom: 15px; }
        .inclusions { background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-top: 15px; }
        .inclusions h4 { margin: 0 0 10px 0; color: #374151; font-size: 14px; }
        .inclusion-item { display: inline-block; background-color: white; border: 1px solid #d1d5db; padding: 4px 8px; border-radius: 4px; margin: 2px; font-size: 12px; }
        .footer { background-color: #1f2937; color: white; padding: 30px; text-align: center; }
        .cta-button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 10px 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🌟 Your Top 3 AI-Curated Travel Deals</h1>
          <p>Personalized recommendations from our AI travel agents</p>
          ${tripDetails ? `<p>For your ${tripDetails.travelType} trip to ${tripDetails.destination}</p>` : ''}
        </div>

        <div class="content">
          ${deals.map((deal, index) => `
            <div class="deal-card">
              <div class="deal-header">
                <div class="agent-badge">${this.getAgentIcon(deal.agent)} ${deal.agent}</div>
                <h3 class="deal-title">${deal.destination} ${deal.description}</h3>
              </div>
              <div class="deal-body">
                <div class="price-section">
                  <div>
                    <div class="current-price">₹${deal.price}</div>
                    <div class="original-price">₹${deal.originalPrice}</div>
                  </div>
                  <div class="savings">Save ${savings[index]}%</div>
                </div>

                <div class="rating">
                  ${'★'.repeat(deal.hotelRating)}${'☆'.repeat(5 - deal.hotelRating)} ${deal.hotelRating}/5 Stars
                </div>

                <p><strong>⏱️ Confirmation Time:</strong> ${deal.confirmationTime}</p>

                <div class="inclusions">
                  <h4>✅ What's Included:</h4>
                  ${deal.inclusions.map(inclusion => `<span class="inclusion-item">${inclusion}</span>`).join('')}
                </div>
              </div>
            </div>
          `).join('')}

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="cta-button">
              🚀 View Full Details & Book
            </a>
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}/chat-logs" class="cta-button">
              💬 View Agent Conversations
            </a>
          </div>
        </div>

        <div class="footer">
          <h3>SmartTravel Pro</h3>
          <p>AI-Powered Travel Planning at Your Fingertips</p>
          <p style="font-size: 12px; opacity: 0.8;">
            This email contains personalized travel recommendations generated by our AI agents.
            Prices and availability are subject to change.
          </p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateDealsEmailText(deals: Deal[], tripDetails?: any): string {
    return `
SmartTravel Pro - Your Top 3 AI-Curated Travel Deals

${tripDetails ? `For your ${tripDetails.travelType} trip to ${tripDetails.destination}` : ''}

${deals.map((deal, index) => {
  const savings = ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0);
  return `
DEAL ${index + 1}: ${deal.agent}
${deal.destination} - ${deal.description}
Price: ₹${deal.price} (was ₹${deal.originalPrice}) - Save ${savings}%
Rating: ${deal.hotelRating}/5 stars
Confirmation: ${deal.confirmationTime}
Includes: ${deal.inclusions.join(', ')}
`;
}).join('\n')}

Visit ${process.env.FRONTEND_URL || 'http://localhost:5000'} to view full details and book your trip.

Best regards,
SmartTravel Pro Team
    `;
  }

  private generateSingleDealEmailHTML(deal: Deal): string {
    const savings = ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0);

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Exclusive Travel Deal</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .deal-card { border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .agent-badge { display: inline-block; background-color: #667eea; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        .price-section { text-align: center; padding: 20px; background-color: #f8fafc; }
        .current-price { font-size: 32px; font-weight: bold; color: #059669; }
        .original-price { font-size: 18px; color: #6b7280; text-decoration: line-through; margin-top: 5px; }
        .savings { background-color: #dcfce7; color: #166534; padding: 8px 16px; border-radius: 8px; font-size: 16px; font-weight: bold; margin-top: 10px; display: inline-block; }
        .deal-details { padding: 25px; }
        .cta-button { display: inline-block; background-color: #059669; color: white; padding: 15px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎯 Exclusive Travel Deal</h1>
          <p>Curated by ${deal.agent}</p>
        </div>

        <div class="content">
          <div class="deal-card">
            <div class="price-section">
              <div class="agent-badge">${this.getAgentIcon(deal.agent)} ${deal.agent}</div>
              <h2>${deal.destination}</h2>
              <div class="current-price">₹${deal.price}</div>
              <div class="original-price">₹${deal.originalPrice}</div>
              <div class="savings">Save ${savings}%</div>
            </div>

            <div class="deal-details">
              <p><strong>⭐ Rating:</strong> ${'★'.repeat(deal.hotelRating)}${'☆'.repeat(5 - deal.hotelRating)} ${deal.hotelRating}/5 Stars</p>
              <p><strong>⏱️ Confirmation:</strong> ${deal.confirmationTime}</p>
              <p><strong>📝 Description:</strong> ${deal.description}</p>

              <h4>✅ What's Included:</h4>
              <ul>
                ${deal.inclusions.map(inclusion => `<li>${inclusion}</li>`).join('')}
              </ul>
            </div>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" class="cta-button">
              🚀 Book This Deal
            </a>
          </div>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  private generateSingleDealEmailText(deal: Deal): string {
    const savings = ((parseFloat(deal.originalPrice) - parseFloat(deal.price)) / parseFloat(deal.originalPrice) * 100).toFixed(0);

    return `
SmartTravel Pro - Exclusive Travel Deal

${deal.agent} has found you an amazing deal!

${deal.destination}
${deal.description}

Price: ₹${deal.price} (was ₹${deal.originalPrice})
You Save: ${savings}%
Rating: ${deal.hotelRating}/5 stars
Confirmation Time: ${deal.confirmationTime}

What's Included:
${deal.inclusions.map(inclusion => `• ${inclusion}`).join('\n')}

Book now at: ${process.env.FRONTEND_URL || 'http://localhost:5000'}

Best regards,
SmartTravel Pro Team
    `;
  }

  private getAgentIcon(agent: string): string {
    const icons = {
      "TravelBot Pro": "👑",
      "VoyageAI": "🏛️",
      "JourneyGenie": "🏔️",
      "WanderBot": "💰",
      "ExploreAI": "✨"
    };
    return icons[agent as keyof typeof icons] || "🤖";
  }
}

export const emailService = new EmailService();
