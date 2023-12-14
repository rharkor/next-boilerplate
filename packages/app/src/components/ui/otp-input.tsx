"use client"
import React, { useRef } from "react"

import { cn } from "@/lib/utils"

export type OtpInputProps = {
  otp: string[]
  setOtp: React.Dispatch<React.SetStateAction<string[]>>
  withAutoFocus?: boolean
}

export default function OtpInput({ otp, setOtp, withAutoFocus }: OtpInputProps) {
  const handleChange = (element: HTMLInputElement, index: number) => {
    const value = element.value
    if (value === "") {
      const newOtp = [...otp]
      newOtp[index] = value
      setOtp(newOtp)
      if (element.previousSibling) {
        ;(element.previousSibling as HTMLInputElement).focus()
      }
      return
    }
    if (isNaN(parseInt(value))) return false // ensures only numbers are allowed
    const newOtp = [...otp]
    newOtp[index] = element.value
    setOtp(newOtp)

    // Move to next input if there's a next input and current input is filled
    if (element.nextSibling && element.value) {
      ;(element.nextSibling as HTMLInputElement).focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pasteData = e.clipboardData
      .getData("text")
      .split("")
      .filter((_, index) => index < otp.length)
      .filter((char) => !isNaN(parseInt(char)))
    if (pasteData.length === otp.length) {
      setOtp(pasteData)
      // Focus the last input after pasting
      const lastInputField = document.querySelectorAll("input")[3]
      if (lastInputField) {
        lastInputField.focus()
      }
    }
  }

  const divRef = useRef<HTMLDivElement>(null)

  return (
    <div className="flex justify-center space-x-1" ref={divRef}>
      {otp.map((data, index) => {
        return (
          <input
            className={cn(
              "border-muted-foreground/50 rounded-medium focus:border-primary h-12 w-12 border-2 text-center text-xl !outline-none transition-all duration-200 ease-in-out",
              {
                "border-primary-400/50": data,
                "!ml-4": index === 3 && otp.length === 6,
              }
            )}
            autoFocus={withAutoFocus && index === 0}
            key={index}
            type="text"
            name={`otp-${index}`}
            maxLength={1}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onPaste={handlePaste}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && index !== 0 && !data) {
                const prevInputField = divRef.current?.querySelectorAll("input")[index - 1]
                if (prevInputField) {
                  prevInputField.focus()
                  e.preventDefault()
                }
              } else if (e.key === "ArrowLeft" && index !== 0) {
                const prevInputField = divRef.current?.querySelectorAll("input")[index - 1]
                if (prevInputField) {
                  prevInputField.focus()
                }
              } else if (e.key === "ArrowRight" && index !== 3) {
                const nextInputField = divRef.current?.querySelectorAll("input")[index + 1]
                if (nextInputField) {
                  nextInputField.focus()
                }
              }
              //? Insert on the input
              else if (data) {
                const value = e.key
                if (isNaN(parseInt(value))) return false // ensures only numbers are allowed
                const newOtp = [...otp]
                newOtp[index] = value
                setOtp(newOtp)
                // Move to next input if there's a next input and current input is filled
                const target = e.target as HTMLInputElement
                if (target.nextSibling && target.value) {
                  ;(target.nextSibling as HTMLInputElement).focus()
                  e.preventDefault()
                }
              }
            }}
          />
        )
      })}
    </div>
  )
}
