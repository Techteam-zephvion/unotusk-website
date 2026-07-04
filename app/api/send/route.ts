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

  try {
    const body = await request.json();
    name = body.name || "";
    email = body.email || "";
    company = body.company || "";
    message = body.message || "";

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

    // Build a highly professional, clean text-based branding template matching the site's styling
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Unotusk</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #F5F3EF;
              color: #2D2722;
              padding: 40px 20px;
              margin: 0;
            }
            .container {
              max-width: 540px;
              background-color: #FFFFFF;
              border: 1px solid rgba(160, 124, 74, 0.16);
              border-radius: 8px;
              padding: 40px;
              margin: 0 auto;
              box-shadow: 0 4px 12px rgba(160, 124, 74, 0.04);
            }
            .header {
              text-align: center;
              border-bottom: 1px solid rgba(160, 124, 74, 0.12);
              padding-bottom: 20px;
              margin-bottom: 25px;
            }
            .logo-text {
              font-size: 20px;
              font-weight: 700;
              letter-spacing: 0.12em;
              color: #1A1512;
              text-transform: uppercase;
              margin: 0;
            }
            .greeting {
              font-size: 18px;
              font-weight: 500;
              margin-top: 0;
              margin-bottom: 16px;
              color: #1A1512;
            }
            .body-text {
              font-size: 14.5px;
              line-height: 1.6;
              color: #4A433D;
              margin-bottom: 24px;
            }
            .message-label {
              font-size: 11px;
              font-weight: 700;
              letter-spacing: 0.05em;
              text-transform: uppercase;
              color: #A07C4A;
              margin-top: 30px;
              margin-bottom: 8px;
            }
            .message-box {
              background-color: #FDFDFD;
              border: 1px dashed rgba(160, 124, 74, 0.2);
              border-radius: 4px;
              padding: 12px 16px;
              font-size: 13.5px;
              line-height: 1.5;
              color: #5A524B;
              white-space: pre-wrap;
            }
            .footer {
              font-size: 11.5px;
              color: #8C847E;
              margin-top: 35px;
              border-top: 1px solid rgba(160, 124, 74, 0.12);
              padding-top: 20px;
              text-align: center;
              line-height: 1.5;
            }
            .footer a {
              color: #A07C4A;
              text-decoration: none;
            }
            .footer a:hover {
              text-decoration: underline;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="logo-text">Unotusk</h1>
            </div>
            
            <h2 class="greeting">Hi ${name},</h2>
            
            <p class="body-text">
              Thank you for requesting early access to <strong>Unotusk</strong>. We are excited to partner with engineering and product leaders at <strong>${company}</strong> to rebuild context around design decision records, code rationale, and development memory.
            </p>
            
            <p class="body-text">
              Our team is currently reviewing every request personally. We will contact you at this email address shortly to schedule a brief walkthrough and set up your team's workspace.
            </p>

            <div class="message-label" style="margin-top: 24px;">Submitted Details:</div>
            <p class="body-text" style="font-size: 13.5px; margin-bottom: 8px; color: #5A524B;">
              <strong>Company:</strong> ${company}
            </p>
            
            ${message ? `
              <div class="message-label" style="margin-top: 16px;">Your message:</div>
              <div class="message-box">${message}</div>
            ` : ''}
            
            <div class="footer">
              Unotusk is built by <a href="https://zepvion.com" target="_blank">Zepvion</a>.<br>
              Learn more at <a href="https://unotusk.com" target="_blank">unotusk.com</a>.
            </div>
          </div>
        </body>
      </html>
    `;

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

    const resendData = await resendResponse.json();

    if (!resendResponse.ok) {
      console.error("Resend API error:", resendData);
      writeSubmissionLog(name, email, company, message, "FAILED", `Resend API error: ${resendData.message || "Unknown error"}`);
      return NextResponse.json(
        { error: resendData.message || "Failed to send email via Resend." },
        { status: resendResponse.status }
      );
    }

    writeSubmissionLog(name, email, company, message, "SUCCESS", `Email ID: ${resendData.id}`);
    return NextResponse.json({ success: true, id: resendData.id });
  } catch (error: any) {
    console.error("Error in API route:", error);
    writeSubmissionLog(name, email, company, message, "FAILED", `Exception: ${error.message || "Unknown error"}`);
    return NextResponse.json(
      { error: error.message || "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
