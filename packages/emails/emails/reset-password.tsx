import { Header } from "components/header"
import * as React from "react"

import { Head, Html, Preview, Text } from "@react-email/components"

import { Body } from "../components/body"
import { Button } from "../components/button"
import { Card } from "../components/card"
import { Container } from "../components/container"
import { Footer } from "../components/footer"

interface ResetPasswordProps {
  resetLink: string
  previewText: string
  logoUrl: string
  name: string
  supportEmail: string
  titleText: string
  footerText: string
  contentTitle: string
  actionText: string
  heyText: string
}

export const ResetPassword = ({
  resetLink,
  previewText,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  actionText,
  heyText,
}: ResetPasswordProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body>
      <Container>
        <Header logoUrl={logoUrl} titleText={titleText} />
        <Card>
          <Text style={text}>
            {heyText} <strong>{name}</strong>!
          </Text>
          <Text style={text}>{contentTitle}</Text>
          <Button href={resetLink}>{actionText}</Button>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: ResetPasswordProps = {
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg",
  name: "John Doe",
  previewText: "Reset password request.",
  supportEmail: "louis@huort.com",
  resetLink: "https://yourapp.com/reset-password?token=abc123",
  titleText: "Reset your password",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle: "You recently requested to reset your password for your account. Click the button below to reset it.",
  actionText: "Reset your password",
  heyText: "Hey",
}
ResetPassword.PreviewProps = previewProps

export default ResetPassword

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const
