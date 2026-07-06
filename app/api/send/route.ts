import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Helper to log all submissions to submissions.log
function writeSubmissionLog(
  name: string,
  email: string,
  company: string,
  message: string,
  status: "SUCCESS" | "FAILED",
  details?: string
) {
  try {
    const logPath = path.join(process.cwd(), "submissions.log");
    const timestamp = new Date().toISOString();
    const cleanMsg = (message || "").replace(/\n/g, "\\n");
    const logLine = `[${timestamp}] STATUS: ${status} | NAME: ${name} | EMAIL: ${email} | COMPANY: ${company} | MESSAGE: ${cleanMsg}${details ? ` | DETAILS: ${details}` : ""}\n`;
    fs.appendFileSync(logPath, logLine, "utf8");
  } catch (err) {
    console.error("Failed to write to submissions.log:", err);
  }
}

export async function POST(request: Request) {
  let name = "";
  let email = "";
  let company = "";
  let message = "";
  let theme = "dark";

  // Self-healing: copy PNG logo assets from fallback files if they don't exist
  try {
    const publicDir = path.join(process.cwd(), "public");
    const darkPng = path.join(publicDir, "logo-dark.png");
    const lightPng = path.join(publicDir, "logo-light.png");
    
    if (!fs.existsSync(darkPng)) {
      const src = path.join(publicDir, "logo_ols.png");
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, darkPng);
        console.log("Successfully copied logo_ols.png to logo-dark.png");
      }
    }
    
    if (!fs.existsSync(lightPng)) {
      const src = path.join(publicDir, "logo_old.png");
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, lightPng);
        console.log("Successfully copied logo_old.png to logo-light.png");
      }
    }
  } catch (err) {
    console.error("Failed to copy PNG logo assets:", err);
  }

  try {
    const body = await request.json();
    name = body.name || "";
    email = body.email || "";
    company = body.company || "";
    message = body.message || "";
    theme = body.theme || "dark";

    // Basic server-side validation
    if (!name || !email || !company) {
      writeSubmissionLog(name, email, company, message, "FAILED", "Validation failed: missing fields");
      return NextResponse.json(
        { error: "Name, email, and company fields are required." },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("Missing RESEND_API_KEY environment variable.");
      writeSubmissionLog(name, email, company, message, "FAILED", "Resend API key missing");
      return NextResponse.json(
        { error: "Email service is not configured. Please set the RESEND_API_KEY." },
        { status: 500 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

    // Absolute public asset URLs pointing to production site
    const baseUrl = "https://unotusk.com";
    const heroImageUrl = `${baseUrl}/UnoTusk%20Design.png`;
    const managePreferencesUrl = `${baseUrl}/early-access`;
    const unsubscribeUrl = `${baseUrl}/early-access`;

    const isLight = theme === "light";

    // Style variables for HTML email
    const bodyBg = isLight ? "#FFFFFF" : "#0D0A08";
    const emailBg = isLight ? "#FFFFFF" : "#0D0A08";
    const textPrimary = isLight ? "#1A1410" : "#F0E8DC";
    const textSecondary = isLight ? "#6E5B44" : "#A89070";
    const borderColor = isLight ? "#E1D4C2" : "#2E2618";
    const heroSurface = isLight ? "#ECE0CF" : "#1A1410";
    const accentColor = "#E8A455";
    const buttonTextColor = "#0D0A08";

    // Build the responsive static HTML template
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="x-apple-disable-message-reformatting">
        <title>Early access confirmed - Unotusk</title>
        <!--[if mso]>
        <xml>
          <o:OfficeDocumentSettings>
            <o:AllowPNG/>
            <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
        </xml>
        <![endif]-->
        <style type="text/css">
          @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=Inter:wght@400;500;600&family=Young+Serif&display=swap');

          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          table { border-collapse: collapse !important; }
          img { -ms-interpolation-mode: bicubic; border: 0; display: block; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
          a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; }
          .button:hover { opacity: 0.92 !important; }

          @media screen and (max-width: 600px) {
            .email-shell { width: 100% !important; }
            .mobile-pad { padding-left: 20px !important; padding-right: 20px !important; }
            .mobile-stack { display: block !important; width: 100% !important; }
            .mobile-center { text-align: left !important; }
            .hero-title { font-size: 38px !important; line-height: 44px !important; }
            .hero-panel { padding: 28px 20px !important; }
            .next-row { padding-top: 24px !important; }
            .message-panel { padding: 20px 20px !important; }
            .footer-link { display: inline-block !important; margin: 0 16px 10px 0 !important; }
          }
        </style>
      </head>
      <body class="body-bg" style="margin:0 !important; padding:0 !important; background-color:${bodyBg};">
        <div style="display:none; max-height:0; overflow:hidden; opacity:0; color:${bodyBg}; font-size:1px; line-height:1px; mso-hide:all;">
          Your early access request has been received. We will review it and follow up with next steps.
        </div>

        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="body-bg" style="background-color:${bodyBg};">
          <tr>
            <td align="center" style="padding:32px 0;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="email-shell email-bg" style="width:100%; max-width:100%; background-color:${emailBg};">
                <tr>
                  <td class="mobile-pad" style="padding:26px 32px 22px 32px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td align="left" valign="middle">
                          <a href="https://www.unotusk.com" target="_blank" aria-label="Unotusk" style="display:block; text-decoration:none;">
                            <img class="logo-light" src="${baseUrl}/logo-light.png" width="142" alt="Unotusk" style="display:${isLight ? 'none' : 'block'}; width:142px; max-width:142px; height:auto;">
                            <img class="logo-dark" src="${baseUrl}/logo-dark.png" width="142" alt="Unotusk" style="display:${isLight ? 'block' : 'none'}; width:142px; max-width:142px; height:auto; ${isLight ? '' : 'mso-hide:all;'}">
                          </a>
                        </td>
                        <td align="right" valign="middle" class="mobile-center">
                          <p class="text-secondary" style="margin:0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:11px; line-height:16px; color:${textSecondary}; letter-spacing:0; text-transform:uppercase;">
                            Early Access
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-pad" style="padding:0 32px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="hero-surface" style="background-color:${heroSurface}; border:1px solid ${borderColor};">
                      <tr>
                        <td align="center" style="padding:0;">
                          <img src="${heroImageUrl}" width="100%" alt="Unotusk mark and wordmark construction — technical drafting, measured annotations" style="display:block; width:100%; max-width:100%; height:auto;">
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-pad" style="padding:58px 32px 0 32px;">
                    <p style="margin:0 0 18px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:12px; line-height:18px; color:${accentColor}; letter-spacing:0; text-transform:uppercase;">
                      Request confirmed
                    </p>
                    <h1 class="hero-title text-primary" style="margin:0; font-family:'Young Serif', Georgia, 'Times New Roman', serif; font-size:48px; line-height:56px; font-weight:400; color:${textPrimary}; letter-spacing:0;">
                      Your early access request is in.
                    </h1>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-pad" style="padding:28px 32px 0 32px;">
                    <p class="text-primary" style="margin:0 0 20px 0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:17px; line-height:28px; color:${textPrimary};">
                      Thanks for requesting early access to Unotusk.
                    </p>
                    <p class="text-secondary" style="margin:0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:16px; line-height:27px; color:${textSecondary};">
                      We have received your request and will review it carefully. Our team is opening access in measured groups so each engineering organization gets the right setup, context, and support from the start.
                    </p>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-pad" style="padding:46px 32px 0 32px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="border-color" style="border-top:1px solid ${borderColor};">
                      <tr>
                        <td class="next-row" style="padding-top:28px;">
                          <p class="text-primary" style="margin:0 0 18px 0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:15px; line-height:22px; color:${textPrimary}; font-weight:600;">
                            What happens next
                          </p>
                          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                            <tr>
                              <td valign="top" width="28" style="padding:0 0 18px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:12px; line-height:24px; color:${accentColor};">01</td>
                              <td style="padding:0 0 18px 0;">
                                <p class="text-secondary" style="margin:0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:15px; line-height:24px; color:${textSecondary};">
                                  We review your request and the engineering context you shared.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td valign="top" width="28" style="padding:0 0 18px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:12px; line-height:24px; color:${accentColor};">02</td>
                              <td style="padding:0 0 18px 0;">
                                <p class="text-secondary" style="margin:0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:15px; line-height:24px; color:${textSecondary};">
                                  If there is a fit for the current early access phase, we will send onboarding details.
                                </p>
                              </td>
                            </tr>
                            <tr>
                              <td valign="top" width="28" style="padding:0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:12px; line-height:24px; color:${accentColor};">03</td>
                              <td style="padding:0;">
                                <p class="text-secondary" style="margin:0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:15px; line-height:24px; color:${textSecondary};">
                                  You will receive future updates from Unotusk as access expands.
                                </p>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                ${message ? `
                <tr>
                  <td style="padding:40px 0 0 0;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="hero-surface" style="background-color:${heroSurface}; border-left:none; border-right:none; border-top:1px solid ${borderColor}; border-bottom:1px solid ${borderColor};">
                      <tr>
                        <td class="message-panel" style="padding:24px 32px;">
                          <p class="text-secondary" style="margin:0 0 8px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:11px; line-height:16px; color:${accentColor}; letter-spacing:0.5px; text-transform:uppercase;">
                            Your message
                          </p>
                          <p class="text-primary" style="margin:0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:14px; line-height:22px; color:${textPrimary}; white-space:pre-wrap;">
                            ${message}
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                ` : ''}

                <tr>
                  <td class="mobile-pad" style="padding:44px 32px 58px 32px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td bgcolor="${accentColor}" style="background-color:${accentColor}; border-radius:0;">
                          <!--[if mso]>
                          <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="https://www.unotusk.com/early-access" style="height:48px;v-text-anchor:middle;width:172px;" arcsize="0%" stroke="f" fillcolor="${accentColor}">
                            <w:anchorlock/>
                            <center style="color:${buttonTextColor};font-family:Arial,sans-serif;font-size:14px;font-weight:bold;">Reserve Your Spot</center>
                          </v:roundrect>
                          <![endif]-->
                          <!--[if !mso]><!-->
                          <a class="button" href="https://www.unotusk.com/early-access" target="_blank" style="display:inline-block; padding:16px 24px; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:14px; line-height:16px; font-weight:600; color:${buttonTextColor}; text-decoration:none;">
                            Reserve Your Spot
                          </a>
                          <!--<![endif]-->
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <tr>
                  <td class="mobile-pad" style="padding:0 32px 42px 32px;">
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" class="border-color" style="border-top:1px solid ${borderColor};">
                      <tr>
                        <td style="padding-top:28px;">
                          <p class="text-primary" style="margin:0 0 4px 0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:14px; line-height:22px; color:${textPrimary}; font-weight:600;">
                            Unotusk
                          </p>
                          <p class="text-secondary" style="margin:0 0 4px 0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:13px; line-height:21px; color:${textSecondary};">
                            The Project Intelligence Engine
                          </p>
                          <p class="text-secondary" style="margin:0 0 22px 0; font-family:Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; font-size:13px; line-height:21px; color:${textSecondary};">
                            By Zephvion
                          </p>
                          <p style="margin:0 0 20px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:11px; line-height:20px; color:${textSecondary};">
                            <a href="https://www.unotusk.com" target="_blank" style="color:${textSecondary}; text-decoration:none;">www.unotusk.com</a><br>
                            <a href="https://www.zephvion.com" target="_blank" style="color:${textSecondary}; text-decoration:none;">www.zephvion.com</a>
                          </p>
                          <p style="margin:0 0 18px 0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:11px; line-height:20px; color:${textSecondary};">
                            <a class="footer-link" href="${managePreferencesUrl}" target="_blank" style="color:${textSecondary}; text-decoration:underline; text-underline-offset:3px;">Manage Preferences</a>
                            <span style="color:${borderColor};">&nbsp;&nbsp;/&nbsp;&nbsp;</span>
                            <a class="footer-link" href="${unsubscribeUrl}" target="_blank" style="color:${textSecondary}; text-decoration:underline; text-underline-offset:3px;">Unsubscribe</a>
                          </p>
                          <p class="text-secondary" style="margin:0; font-family:'IBM Plex Mono', 'Courier New', Courier, monospace; font-size:10px; line-height:18px; color:${textSecondary};">
                            Copyright &copy; 2026 Zephvion. All rights reserved.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      // Make direct HTTP API request to Resend
      const resendResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: fromEmail,
          to: email,
          reply_to: email,
          subject: `Welcome to Unotusk — Early Access Request Received`,
          html: emailHtml,
        }),
      });

      let resendData: any = {};
      try {
        resendData = await resendResponse.json();
      } catch (e) {
        console.error("Failed to parse Resend response JSON:", e);
      }

      if (!resendResponse.ok) {
        console.error("Resend API error:", resendData);
        const errorMsg = resendData.message || "Failed to send email via Resend.";
        writeSubmissionLog(name, email, company, message, "FAILED", `Resend API error: ${errorMsg}`);
        return NextResponse.json(
          { error: errorMsg },
          { status: resendResponse.status || 400 }
        );
      }

      writeSubmissionLog(name, email, company, message, "SUCCESS", `Email ID: ${resendData.id}`);
      return NextResponse.json({ success: true, id: resendData.id });
    } catch (error: any) {
      console.error("Error in API route email sender:", error);
      const errorMsg = error.message || "An unexpected error occurred.";
      writeSubmissionLog(name, email, company, message, "FAILED", `Exception: ${errorMsg}`);
      return NextResponse.json(
        { error: errorMsg },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error in main request handler:", error);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
