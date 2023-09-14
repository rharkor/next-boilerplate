export const subject = "Verify your email address"

export const plainText = (verificationLink: string) => `Email Verification

Hello,

Thank you for signing up with us. Please verify your email address by clicking the following link:

${verificationLink}

If you did not sign up for an account, you can safely ignore this email.

This email was sent to you as part of our account services. If you have any questions, please contact us at support@example.com.
`

export const html = (verificationLink: string) => `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            width: 100px;
            height: auto;
        }

        .content {
            margin-bottom: 20px;
        }

        .button {
            display: inline-block;
            padding: 10px 20px;
            background-color: #28A745;
            color: #fff;
            text-decoration: none;
            border-radius: 5px;
        }

        .footer {
            text-align: center;
            font-size: 12px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <img src="https://example.com/logo.png" alt="Logo" class="logo">
            <h1>Email Verification</h1>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>Thank you for signing up with us. Please verify your email address by clicking the button below:</p>
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            <p>If you did not sign up for an account, you can safely ignore this email.</p>
        </div>
        <div class="footer">
            <p>This email was sent to you as part of our account services. If you have any questions, please contact us
                at support@example.com.</p>
        </div>
    </div>
</body>

</html>`
