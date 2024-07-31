import React, { ReactNode } from "react"

import { Section as OSection, SectionProps } from "@react-email/components"

import { content1 } from "../constants"

export const Card = ({
  children,
  ...props
}: {
  children: ReactNode
} & SectionProps) => {
  return (
    <OSection
      {...props}
      style={{
        ...cardStyle,
        ...props.style,
      }}
    >
      {children}
    </OSection>
  )
}

const cardStyle = {
  padding: "24px",
  boxShadow: "0px 0px 15px 0px rgba(0,0,0,.03),0px 2px 30px 0px rgba(0,0,0,.08),0px 0px 1px 0px rgba(0,0,0,.3)",
  borderRadius: "12px",
  textAlign: "center",
  backgroundColor: content1,
} as const
