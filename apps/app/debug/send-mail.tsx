import readline from "node:readline/promises"

import { sendMail } from "@/lib/mailer"
import VerifyEmail, { previewProps } from "@next-boilerplate/transactional/emails/verify-email"
import { render } from "@react-email/render"

const main = async () => {
  const element = VerifyEmail(previewProps)
  const text = render(element, {
    plainText: true,
  })
  const html = render(element)

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })
  const to = await rl.question("To: ")
  rl.close()

  await sendMail({
    to,
    subject: "TEST",
    text,
    html,
  })
}

main()
