import { createTransport } from "nodemailer"

import { env } from "@/lib/env"
import { logger } from "@next-boilerplate/lib"

import { ApiError } from "./utils/server-utils"

export const configOptions = {
  port: env.SMTP_PORT,
  host: env.SMTP_HOST,
  username: env.SMTP_USERNAME,
  password: env.SMTP_PASSWORD,
}

const transporter = createTransport({
  port: configOptions.port,
  host: configOptions.host,
  auth: {
    user: configOptions.username,
    pass: configOptions.password,
  },
})

export const sendMail = async (...params: Parameters<typeof transporter.sendMail>) => {
  if (!env.NEXT_PUBLIC_ENABLE_MAILING_SERVICE) {
    logger.error("Email service is disabled, sending email is skipped.")
    return ApiError("emailServiceDisabled", "PRECONDITION_FAILED")
  }
  try {
    const res = await transporter.sendMail(...params)
    logger.info(`Email sent to ${res.envelope.to}`)
  } catch (error) {
    logger.error(`Error sending message: ${error}`)
    throw error
  }
}
