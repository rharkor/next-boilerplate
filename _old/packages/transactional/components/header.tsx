import React from "react"

import { Img, Text } from "@react-email/components"

export const Header = ({ logoUrl, titleText }: { logoUrl: string; titleText: string }) => {
  return (
    <>
      <Img src={logoUrl} width="32" height="32" alt="Next boilerplate" />
      <Text style={title}>{titleText}</Text>
    </>
  )
}

const title = {
  fontSize: "24px",
  lineHeight: 1.25,
}
