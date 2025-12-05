const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Create email transporter
const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Email transporter error:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// Function to extract title and tagline from email
function getEmailBranding(email) {
  try {
    const [localPart, domain] = email.split('@');
    
    if (domain.toLowerCase().includes('gmail')) {
      const titleWithoutNumbers = localPart.replace(/[0-9.]/g, '');
      const title = titleWithoutNumbers.charAt(0).toUpperCase() + titleWithoutNumbers.slice(1);
      return {
        title: title || 'User',
        tagline: 'Legal & Professional Services'
      };
    } else {
      const domainParts = domain.split('.');
      const companyName = domainParts[0].replace(/[0-9]/g, '');
      const title = companyName.charAt(0).toUpperCase() + companyName.slice(1);
      return {
        title: title || 'Company',
        tagline: 'Combine Technology with Business'
      };
    }
  } catch (error) {
    return {
      title: 'Legal Communications',
      tagline: 'Legal & Professional Services'
    };
  }
}

// Bulk email sending endpoint
app.post('/api/send-bulk-email', async (req, res) => {
  try {
    const { recipients, subject, message } = req.body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipients array is required' 
      });
    }

    if (!subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject and message are required' 
      });
    }

    const senderBranding = getEmailBranding(process.env.EMAIL_USER);
    const senderTitle = senderBranding.title;
    const senderTagline = senderBranding.tagline;
    console.log(`Sender branding (footer) - Title: ${senderTitle}, Tagline: ${senderTagline}`);

    const results = await Promise.allSettled(
      recipients.map(recipient => {
        const recipientBranding = getEmailBranding(recipient);
        const recipientTitle = recipientBranding.title;
        const recipientTagline = recipientBranding.tagline;
        console.log(`Sending to ${recipient} | Header: ${recipientTitle} | Footer: ${senderTitle}`);
        
        // Read logo images
        const logoPath = path.join(__dirname, 'images', 'logo.png');
        const developersinfoLogoPath = path.join(__dirname, 'images', 'Developersinfotech.png');
        
        console.log('Logo path:', logoPath);
        console.log('Developersinfotech logo path:', developersinfoLogoPath);
        console.log('Logo exists:', fs.existsSync(logoPath));
        console.log('Developersinfotech logo exists:', fs.existsSync(developersinfoLogoPath));
        
        return transporter.sendMail({
          from: `"${process.env.EMAIL_NAME}" <${process.env.EMAIL_USER}>`,
          to: recipient,
          subject: subject,
          attachments: [
            {
              filename: 'logo.png',
              path: logoPath,
              cid: 'uniquelogoimage'
            },
            {
              filename: 'Developersinfotech.png',
              path: developersinfoLogoPath,
              cid: 'uniquedevelopersinfotechimage'
            }
          ],
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="margin: 0; padding: 0; background: #f8f9fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
                <tr>
                  <td align="center">
                    <!-- Main Container -->
                    <table width="650" cellpadding="0" cellspacing="0" style="max-width: 650px; background: #ffffff; overflow: hidden; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08); border: 1px solid #e0e0e0;">
                      
                      <!-- Elegant Header with Pattern -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 0; position: relative;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="padding: 36px 45px 32px 45px; text-align: center;">
                                <!-- Centered Logo Container -->
                                <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto;">
                                  <tr>
                                    <td style="vertical-align: middle; text-align: center; padding-right: 12px;">
                                      <!-- Logo Image with Yellow Background -->
                                      <table width="60" height="60" cellpadding="0" cellspacing="0" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(244, 208, 63, 0.3);">
                                        <tr>
                                          <td align="center" valign="middle" style="text-align: center; vertical-align: middle;">
                                            <img src="cid:uniquelogoimage" alt="Logo" style="display: block; width: 60px; height: 60px; margin: 0 auto;" />
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="vertical-align: middle; text-align: left;">
                                      <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 28px; font-weight: 700; color: #ffffff; line-height: 1; letter-spacing: -0.5px; white-space: nowrap; margin: 0;">${recipientTitle}</div>
                                      <div style="font-size: 13px; color: #a0aec0; margin-top: 4px; letter-spacing: 0.5px; white-space: nowrap; line-height: 1;">${recipientTagline}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Gold Accent Bar -->
                      <tr>
                        <td style="height: 5px; background: linear-gradient(90deg, #f4d03f 0%, #f7dc6f 50%, #f4d03f 100%);"></td>
                      </tr>
                      
                      <!-- Document Reference Bar -->
                      <tr>
                        <td style="background: #f7f7f8; padding: 20px 45px; border-bottom: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align: middle;">
                                <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.2px; color: #6b7280; font-weight: 700;">Official Correspondence</div>
                              </td>
                              <td style="text-align: right; vertical-align: middle;">
                                <div style="font-size: 11px; color: #9ca3af; font-family: 'Courier New', monospace;">REF: ${Date.now().toString().slice(-8)}</div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Subject Section -->
                      <tr>
                        <td style="padding: 36px 45px 28px 45px; background: #ffffff;">
                          <div style="border-left: 4px solid #f4d03f; padding-left: 20px; margin-bottom: 8px;">
                            <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 1.3px; color: #9ca3af; font-weight: 700; margin-bottom: 10px;">RE: SUBJECT MATTER</div>
                            <h1 style="margin: 0; font-family: 'Georgia', 'Times New Roman', serif; color: #1f2937; font-size: 24px; font-weight: 700; line-height: 1.4;">${subject}</h1>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Main Message Body -->
                      <tr>
                        <td style="padding: 0 45px 40px 45px; background: #ffffff;">
                          <div style="color: #374151; font-size: 15px; line-height: 1.8; white-space: pre-wrap; text-align: justify; font-family: 'Georgia', 'Times New Roman', serif;">${message}</div>
                        </td>
                      </tr>
                      
                      <!-- Signature Line -->
                      <tr>
                        <td style="padding: 0 45px 32px 45px; background: #ffffff;">
                          <div style="border-top: 2px solid #e5e7eb; padding-top: 24px;">
                            <div style="color: #6b7280; font-size: 13px; line-height: 1.6; font-style: italic;">
                              This communication contains important legal information.
                            </div>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Confidentiality Notice -->
                      <tr>
                        <td style="background: #f9fafb; padding: 28px 45px; border-top: 1px solid #e5e7eb;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="vertical-align: top;">
                                <div style="background: #fff3cd; border-left: 3px solid #f4d03f; padding: 16px 18px; border-radius: 4px;">
                                  <div style="font-size: 11px; color: #856404; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 6px;">⚠️ Confidential & Privileged</div>
                                  <div style="font-size: 12px; color: #856404; line-height: 1.6;">
                                    This email and any files transmitted with it are confidential and intended solely for the use of the individual or entity to whom they are addressed. If you have received this email in error, please notify the sender immediately and delete this email from your system.
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Professional Footer with Developersinfotech Logo -->
                      <tr>
                        <td style="background: linear-gradient(135deg, #1a1f2e 0%, #2d3748 100%); padding: 32px 45px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="text-align: center;">
                                <!-- Centered Developersinfotech Logo Container -->
                                <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px auto;">
                                  <tr>
                                    <td style="vertical-align: middle; text-align: center; padding-right: 12px;">
                                      <!-- Developersinfotech Logo Image -->
                                      <table width="60" height="60" cellpadding="0" cellspacing="0" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(244, 208, 63, 0.3);">
                                        <tr>
                                          <td align="center" valign="middle" style="text-align: center; vertical-align: middle;">
                                            <img src="cid:uniquedevelopersinfotechimage" alt="Developersinfotech Logo" style="display: block; width: 100px; height: 50px; margin: 0 auto;" />
                                          </td>
                                        </tr>
                                      </table>
                                    </td>
                                    <td style="vertical-align: middle; text-align: left; margin-top: 4px">
                                      <div style="font-family: 'Georgia', 'Times New Roman', serif; font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1; letter-spacing: -0.5px; white-space: nowrap; margin: 0;">${senderTitle}</div>
                                      <div style="font-size: 14px; color: #cbd5e0; margin-top: 4px; letter-spacing: 0.5px; white-space: nowrap; line-height: 1;">${senderTagline}</div>
                                    </td>
                                  </tr>
                                </table>
                                
                                <!-- Website Link with Globe Emoji -->
                                <table cellpadding="0" cellspacing="0" align="center" style="margin: 0 auto 12px auto;">
                                  <tr>
                                    <td style="font-size: 15px; color: #cbd5e0; padding-right: 8px; vertical-align: middle;">🌐</td>
                                    <td style="font-size: 15px; color: #cbd5e0; vertical-align: middle;">Developersinfotech.in</td>
                                  </tr>
                                </table>
                                
                                <div style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 12px; margin-top: 12px;">
                                  <div style="font-size: 11px; color: #a0aec0; line-height: 1.6;">
                                    This is an automated message from a secure system. Please do not reply to this email.<br/>
                                    For assistance, contact your designated legal representative.
                                  </div>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      
                      <!-- Bottom Gold Accent -->
                      <tr>
                        <td style="height: 5px; background: linear-gradient(90deg, #f4d03f 0%, #f7dc6f 50%, #f4d03f 100%);"></td>
                      </tr>
                      
                    </table>
                    
                    <!-- Legal Disclaimer -->
                    <table width="650" cellpadding="0" cellspacing="0" style="max-width: 650px; margin-top: 28px;">
                      <tr>
                        <td style="text-align: center; padding: 0 45px;">
                          <p style="color: #9ca3af; font-size: 10px; margin: 0; line-height: 1.7;">
                            <strong>${senderTitle}</strong> | Secure Legal Correspondence Platform<br/>
                            This message was sent via an automated attorney-client communication system.<br/>
                            © ${new Date().getFullYear()} ${senderTitle}. All rights reserved. Confidential and Privileged Communication.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `
        });
      })
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    const failedEmails = results
      .map((result, index) => ({
        email: recipients[index],
        status: result.status,
        reason: result.status === 'rejected' ? result.reason.message : null
      }))
      .filter(item => item.status === 'rejected');

    console.log(`Sent ${successful} emails successfully, ${failed} failed`);
    if (failedEmails.length > 0) {
      console.log('Failed emails:', failedEmails);
    }

    res.status(200).json({
      success: true,
      message: 'Bulk email sending completed',
      successful,
      failed,
      failedEmails: failedEmails.length > 0 ? failedEmails : undefined
    });

  } catch (error) {
    console.error('Bulk email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk emails',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});