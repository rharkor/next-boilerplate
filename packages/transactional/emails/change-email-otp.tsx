import * as React from "react"

import { CodeInline, Container as OContainer, Head, Html, Preview, Text } from "@react-email/components"

import { Body } from "../components/body"
import { Card } from "../components/card"
import { Container } from "../components/container"
import { Footer } from "../components/footer"
import { Header } from "../components/header"
import HeyText from "../components/hey-text"
import { muted } from "../constants"

interface ChangeEmailProps {
  previewText: string
  code: string
  logoUrl: string
  name: string
  supportEmail: string
  titleText: string
  footerText: string
  contentTitle: string
  heyText: string
}

export const ChangeEmail = ({
  previewText,
  code,
  logoUrl,
  name,
  supportEmail,
  titleText,
  footerText,
  contentTitle,
  heyText,
}: ChangeEmailProps) => (
  <Html>
    <Head />
    <Preview>{previewText}</Preview>
    <Body>
      <Container>
        <Header logoUrl={logoUrl} titleText={titleText} />
        <Card>
          <HeyText heyText={heyText} name={name} />
          <Text style={text}>{contentTitle}</Text>
          <OContainer style={codeContainerStyle}>
            <CodeInline>{code}</CodeInline>
          </OContainer>
        </Card>
        <Footer supportEmail={supportEmail} footerText={footerText} logoUrl={logoUrl} />
      </Container>
    </Body>
  </Html>
)

export const previewProps: ChangeEmailProps = {
  logoUrl:
    "https://imgs.search.brave.com/I_nW-x21BB6_TTk_xXuYVy5pZlaMfv0h4q35oqhrxvc/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9zZWVr/bG9nby5jb20vaW1h/Z2VzL04vbmV4dC1q/cy1pY29uLWxvZ28t/RUUzMDJENURCRC1z/ZWVrbG9nby5jb20u/cG5n",
  name: "John Doe",
  previewText: "Confirm your new email",
  supportEmail: "louis@huort.com",
  code: "123456",
  titleText: "Confirm your new email",
  footerText:
    "This email was sent to you as part of our account services. If you have any questions, please contact us at",
  contentTitle:
    "You have requested to change your email address. Please use the following code to validate your request.",
  heyText: "Hey",
}
ChangeEmail.PreviewProps = previewProps

export default ChangeEmail

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const

const codeContainerStyle = {
  backgroundColor: muted,
  borderRadius: "12px",
  fontSize: "22px",
  padding: "10px",
  width: "max-content",
  textAlign: "center",
  margin: "1rem auto 0",
} as const
