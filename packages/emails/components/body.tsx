import React, { ReactNode } from "react"

import { Body as OBody, BodyProps } from "@react-email/components"

import { background, foreground } from "../constants"

export const Body = ({
  children,
  ...props
}: {
  children: ReactNode
} & BodyProps) => {
  return (
    <OBody
      {...props}
      style={{
        ...bodyStyle,
        ...props.style,
      }}
    >
      {children}
    </OBody>
  )
}

const bodyStyle = {
  backgroundColor: background,
  color: foreground,
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji"',
} as const
