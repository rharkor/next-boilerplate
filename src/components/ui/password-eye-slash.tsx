"use client"

import React, { useState } from "react"
import { Input, InputProps } from "./input"
import { Icons } from "../icons"

const PasswordEyeSlash = React.forwardRef<HTMLInputElement, InputProps>((field: InputProps, ref) => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="relative">
      <Input type={showPassword ? "text" : "password"} ref={ref} {...field} />
      <button
        type="button"
        className="absolute right-0 top-0 flex h-full items-center justify-center px-3 text-gray-400 hover:text-gray-500"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? <Icons.eyeOpen /> : <Icons.eyeClosed />}
      </button>
    </div>
  )
})
PasswordEyeSlash.displayName = "PasswordEyeSlash"

export { PasswordEyeSlash }
