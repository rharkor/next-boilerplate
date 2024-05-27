import { Header } from "components/header"
import * as React from "react"

import { Head, Html, Preview, Text } from "@react-email/components"

import { Body } from "../components/body"
import { Button } from "../components/button"
import { Card } from "../components/card"
import { Container } from "../components/container"
import { Footer } from "../components/footer"

interface VerifyEmailProps {
  verificationLink: string
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

export const VerifyEmail = ({
  verificationLink,
  previewText,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  actionText,
  heyText,
}: VerifyEmailProps) => (
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
          <Button href={verificationLink}>{actionText}</Button>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: VerifyEmailProps = {
  logoUrl: "https://upload.wikimedia.org/wikipedia/commons/5/5e/Vercel_logo_black.svg",
  name: "John Doe",
  previewText: "Verify your email address to complete your registration.",
  supportEmail: "louis@huort.com",
  verificationLink: "https://yourapp.com/verify-email?token=abc123",
  titleText: "Verify your email address",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle:
    "Thanks for signing up for Next boilerplate. To complete your registration, we just need to verify your email address.",
  actionText: "Verify email",
  heyText: "Hey",
}
VerifyEmail.PreviewProps = previewProps

export default VerifyEmail

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const
