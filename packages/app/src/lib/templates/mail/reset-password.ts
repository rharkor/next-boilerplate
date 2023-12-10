import { env } from "env.mjs"

export const subject = "Reset your password"

export const plainText = (username: string, resetLink: string, locale: string) => {
  const en = `Password Reset

Hello ${username},

We received a request to reset your password. You can reset your password by clicking the following link:

${resetLink}

If you did not request this password reset, you can safely ignore this email.

This email was sent to you as part of our account services.${
    env.SUPPORT_EMAIL ? ` If you have any questions, please contact us at ${env.SUPPORT_EMAIL}.` : ""
  }
`
  const fr = `Réinitialiser votre mot de passe

Bonjour ${username},

Nous avons reçu une demande de réinitialisation de votre mot de passe. Vous pouvez réinitialiser votre mot de passe en cliquant sur le lien suivant :

${resetLink}

Si vous n'avez pas demandé cette réinitialisation de mot de passe, vous pouvez ignorer cet e-mail en toute sécurité.

Ce courriel vous a été envoyé dans le cadre de nos services de compte.${
    env.SUPPORT_EMAIL ? ` Si vous avez des questions, veuillez nous contacter à l'adresse ${env.SUPPORT_EMAIL}.` : ""
  }
`
  if (locale === "fr") return fr
  return en
}

export const html = (username: string, resetLink: string, locale: string) => `<!DOCTYPE html>
<html xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office" lang="${locale}">

<head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <!--[if mso]><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch><o:AllowPNG/></o:OfficeDocumentSettings></xml><![endif]-->
    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 0;
        }

        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: inherit !important;
        }

        #MessageViewBody a {
            color: inherit;
            text-decoration: none;
        }

        p {
            line-height: inherit
        }

        .desktop_hide,
        .desktop_hide table {
            mso-hide: all;
            display: none;
            max-height: 0px;
            overflow: hidden;
        }

        .image_block img+div {
            display: none;
        }

        @media (max-width:700px) {
            .desktop_hide table.icons-inner {
                display: inline-block !important;
            }

            .icons-inner {
                text-align: center;
            }

            .icons-inner td {
                margin: 0 auto;
            }

            .mobile_hide {
                display: none;
            }

            .row-content {
                width: 100% !important;
            }

            .stack .column {
                width: 100%;
                display: block;
            }

            .mobile_hide {
                min-height: 0;
                max-height: 0;
                max-width: 0;
                overflow: hidden;
                font-size: 0px;
            }

            .desktop_hide,
            .desktop_hide table {
                display: table !important;
                max-height: none !important;
            }
        }
    </style>
</head>

<body style="background-color: #fff0e3; margin: 0; padding: 0; -webkit-text-size-adjust: none; text-size-adjust: none;">
    <table class="nl-container" width="100%" border="0" cellpadding="0" cellspacing="0" role="presentation"
        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff0e3;">
        <tbody>
            <tr>
                <td>
                    <div style="height: 100px;"></div>
                    <table class="row row-4" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 680px; margin: 0 auto; border-radius: 1rem 1rem 0 0;"
                                        width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="100%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:35px;line-height:35px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="heading_block block-2" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad" style="text-align:center;width:100%;">
                                                                <h1
                                                                    style="margin: 0; color: #101010; direction: ltr; font-family: Arial, Helvetica Neue, Helvetica, sans-serif; font-size: 27px; font-weight: normal; letter-spacing: normal; line-height: 120%; text-align: center; margin-top: 0; margin-bottom: 0;">
                                                                    <strong>
                                                                    ${
                                                                      locale === "fr"
                                                                        ? "Mot de passe oublié ?"
                                                                        : "Forgot Your Password?"
                                                                    }
                                                                    </strong>
                                                                </h1>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <table class="row row-5" align="center" width="100%" border="0" cellpadding="0" cellspacing="0"
                        role="presentation" style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                        <tbody>
                            <tr>
                                <td>
                                    <table class="row-content stack" align="center" border="0" cellpadding="0"
                                        cellspacing="0" role="presentation"
                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; background-color: #fff; color: #000; width: 680px; margin: 0 auto; border-radius: 0 0 1rem 1rem;"
                                        width="680">
                                        <tbody>
                                            <tr>
                                                <td class="column column-1" width="16.666666666666668%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
                                                </td>
                                                <td class="column column-2" width="66.66666666666667%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <table class="paragraph_block block-1" width="100%" border="0"
                                                        cellpadding="0" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; word-break: break-word;">
                                                        <tr>
                                                            <td class="pad"
                                                                style="padding-bottom:10px;padding-left:20px;padding-right:10px;padding-top:10px;">
                                                                <div
                                                                    style="color:#848484;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:14px;line-height:180%;text-align:center;mso-line-height-alt:25.2px;">
                                                                    <p style="margin: 0; word-break: break-word;">
                                                                        <span>
                                                                        ${
                                                                          locale === "fr"
                                                                            ? `Bonjour ${username}, vous avez récemment demandé à réinitialiser votre mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour le réinitialiser.`
                                                                            : `
                                                                            Hi ${username}, you recently requested to reset your password for your account. Click the button below to reset it.`
                                                                        }
                                                                        </span>
                                                                    </p>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-2"
                                                        style="height:10px;line-height:10px;font-size:1px;">&#8202;
                                                    </div>
                                                    <table class="button_block block-3" width="100%" border="0"
                                                        cellpadding="10" cellspacing="0" role="presentation"
                                                        style="mso-table-lspace: 0pt; mso-table-rspace: 0pt;">
                                                        <tr>
                                                            <td class="pad">
                                                                <div class="alignment" align="center">
                                                                    <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${resetLink}" style="height:44px;width:160px;v-text-anchor:middle;" arcsize="10%" strokeweight="0.75pt" strokecolor="#101" fillcolor="#101"><w:anchorlock/><v:textbox inset="0px,0px,0px,0px"><center style="color:#ffffff; font-family:Arial, sans-serif; font-size:16px"><![endif]--><a
                                                                        href="${resetLink}" target="_blank"
                                                                        style="text-decoration:none;display:inline-block;color:#ffffff;background-color:#101;border-radius:4px;width:auto;border-top:1px solid #101;font-weight:undefined;border-right:1px solid #101;border-bottom:1px solid #101;border-left:1px solid #101;padding-top:5px;padding-bottom:5px;font-family:Arial, Helvetica Neue, Helvetica, sans-serif;font-size:16px;text-align:center;mso-border-alt:none;word-break:keep-all;"><span
                                                                            style="padding-left:20px;padding-right:20px;font-size:16px;display:inline-block;letter-spacing:normal;"><span
                                                                                style="word-break: break-word; line-height: 32px;">
                                                                                ${
                                                                                  locale === "fr"
                                                                                    ? "Réinitialiser le mot de passe"
                                                                                    : "Reset Password"
                                                                                }
                                                                                </span></span></a><!--[if mso]></center></v:textbox></v:roundrect><![endif]-->
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <div class="spacer_block block-4"
                                                        style="height:20px;line-height:20px;font-size:1px;">&#8202;
                                                    </div>
                                                </td>
                                                <td class="column column-3" width="16.666666666666668%"
                                                    style="mso-table-lspace: 0pt; mso-table-rspace: 0pt; font-weight: 400; text-align: left; padding-bottom: 5px; padding-top: 5px; vertical-align: top; border-top: 0px; border-right: 0px; border-bottom: 0px; border-left: 0px;">
                                                    <div class="spacer_block block-1"
                                                        style="height:0px;line-height:0px;font-size:1px;">&#8202;</div>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <div style="height: 100px;"></div>
                </td>
            </tr>
        </tbody>
    </table><!-- End -->
</body>

</html>`
