import React, { ReactNode } from "react"

import { Section as OSection, SectionProps } from "@react-email/components"

export const Container = ({
  children,
  ...props
}: {
  children: ReactNode
} & SectionProps) => {
  return (
    <OSection
      {...props}
      style={{
        ...containerStyle,
        ...props.style,
      }}
    >
      {children}
    </OSection>
  )
}

const containerStyle = {
  maxWidth: "480px",
  margin: "0 auto",
  padding: "20px 12px 48px",
} as const
