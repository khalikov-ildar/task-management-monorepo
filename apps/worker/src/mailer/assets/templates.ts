import { UUID } from 'node:crypto';

/* eslint-disable max-len */
const baseUrlPlaceholder = '{{URL}}';
const tokenPlaceHolder = '{{TOKEN}}';

const emailConfirmationTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <!--[if mso]>
    <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; text-align: center;">Confirm Your Email Address</h1>
                        </td>
                    </tr>
                    
                    <tr>
                        <td style="padding: 40px 30px;">
                            <p style="margin: 0 0 20px 0; color: #374151; line-height: 1.6;">Thanks for signing up! Please confirm your email address by clicking the button below:</p>
                            
                            <div style="text-align: center; margin: 30px 0;">
                                <a href="${baseUrlPlaceholder}/confirm-email?token=${tokenPlaceHolder}" style="background-color: #6366f1; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; display: inline-block; font-weight: bold; border: 1px solid #4f46e5;">Confirm Email Address</a>
                            </div>
                            
                            <p style="margin: 20px 0; color: #6b7280; line-height: 1.6; font-size: 14px;">If you didn't create an account, you can safely ignore this email.</p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

const passwordResetRequestTemplate = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset</title>
  </head>
  <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f7; color: #333;">

    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; margin: 20px auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">
      <tr>
        <td align="center" style="padding: 20px; background-color: #4CAF50; border-top-left-radius: 8px; border-top-right-radius: 8px;">
          <h1 style="font-size: 24px; margin: 0; color: #ffffff;">Password Reset Request</h1>
        </td>
      </tr>
      <tr>
        <td style="padding: 20px;">
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            Hello,
          </p>
          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            Please enter your new password below and click "Submit" to reset it. If you didn't request a password reset, please ignore this email.
          </p>

          <form action="${baseUrlPlaceholder}/" method="POST" style="margin: 20px 0;">
            <label for="password" style="display: block; font-size: 16px; color: #333333; margin-bottom: 8px;">New Password:</label>
            <input type="password" id="password" name="password" required 
                  style="width: 100%; padding: 12px; font-size: 16px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box;">
            <div style="text-align: center; margin-top: 20px;">
              <button type="submit" 
                      style="font-size: 16px; padding: 12px 24px; color: #ffffff; background-color: #4CAF50; border: none; border-radius: 5px; cursor: pointer;">
                Submit
              </button>
            </div>
          </form>

          <p style="font-size: 16px; line-height: 1.6; color: #333333;">
            If you’re having trouble with the form, please copy and paste the following link into your browser to reset your password:
          </p>
          <p style="font-size: 14px; color: #555555; word-break: break-all;">
            <a href="${baseUrlPlaceholder}" style="color: #4CAF50; text-decoration: none;">${baseUrlPlaceholder}</a>
          </p>
          <p style="font-size: 14px; color: #999999; margin-top: 20px;">
            This link will expire in 24 hours.
          </p>
        </td>
      </tr>
      <tr>
        <td align="center" style="padding: 20px; background-color: #f4f4f7; color: #777777; font-size: 12px;">
          <p style="margin: 0;">
            © 2024 Your Company. All rights reserved.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const passwordResetSuccessfullyTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <title>Email Confirmation</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, sans-serif;">
    <!--[if mso]>
    <style type="text/css">
    body, table, td {font-family: Arial, sans-serif !important;}
    </style>
    <![endif]-->
    
    <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
            <td align="center" style="padding: 20px 0;">
                <table role="presentation" width="600" border="0" cellspacing="0" cellpadding="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.05);">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%); border-radius: 8px 8px 0 0;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; text-align: center;">Confirm Your Email Address</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h1 style="margin: 0 0 20px 0; color: #374151; line-height: 1.6;">Password was changed successfully</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;

type TemplateKeys = 'emailConfirmation' | 'passwordResetRequest' | 'passwordResetSuccess';
const templateKeysMap: Record<TemplateKeys, TemplateKeys> = {
  emailConfirmation: 'emailConfirmation',
  passwordResetRequest: 'passwordResetRequest',
  passwordResetSuccess: 'passwordResetSuccess',
} as const;

export const Templates: Record<TemplateKeys, string> = {
  emailConfirmation: emailConfirmationTemplate,
  passwordResetRequest: passwordResetRequestTemplate,
  passwordResetSuccess: passwordResetSuccessfullyTemplate,
} as const;

type TemplateKeysMap = typeof templateKeysMap;

export function createTemplateWithGivenUrl(baseUrl: string, templateKey: TemplateKeysMap['passwordResetSuccess']): string;
export function createTemplateWithGivenUrl(baseUrl: string, templateKey: TemplateKeysMap['emailConfirmation'], tokenId: UUID): string;
export function createTemplateWithGivenUrl(baseUrl: string, templateKey: TemplateKeysMap['passwordResetRequest'], tokenId: UUID): string;
export function createTemplateWithGivenUrl(baseUrl: string, templateKey: keyof TemplateKeysMap, tokenId?: UUID): string {
  const templateWithUrl = Templates[templateKey].replaceAll(baseUrlPlaceholder, baseUrl);

  return tokenId ? templateWithUrl.replaceAll(tokenPlaceHolder, tokenId) : templateWithUrl;
}
