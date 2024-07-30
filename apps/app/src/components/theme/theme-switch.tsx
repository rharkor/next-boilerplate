"use client"

import { FC } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { SwitchProps, useSwitch } from "@nextui-org/switch"
import { useIsSSR } from "@react-aria/ssr"
import { VisuallyHidden } from "@react-aria/visually-hidden"

export interface ThemeSwitchProps {
  className?: string
  classNames?: SwitchProps["classNames"]
}

export const ThemeSwitch: FC<ThemeSwitchProps> = ({ className, classNames }) => {
  const { theme, setTheme, systemTheme } = useTheme()
  const curTheme = theme === "system" ? (systemTheme ?? "light") : theme
  const isSSR = useIsSSR()

  const onChange = () => {
    curTheme === "light" ? setTheme("dark") : setTheme("light")
  }

  const { Component, slots, isSelected, getBaseProps, getInputProps, getWrapperProps } = useSwitch({
    isSelected: curTheme === "light" || isSSR,
    "aria-label": `Switch to ${curTheme === "light" || isSSR ? "dark" : "light"} mode`,
    onChange,
  })

  return (
    <Component
      {...getBaseProps({
        className: cn("px-px transition-opacity hover:opacity-80 cursor-pointer", className, classNames?.base),
      })}
    >
      <VisuallyHidden>
        <input {...getInputProps()} />
      </VisuallyHidden>
      <div
        {...getWrapperProps()}
        className={slots.wrapper({
          class: cn(
            [
              "h-auto w-auto",
              "bg-transparent",
              "rounded-lg",
              "flex items-center justify-center",
              "group-data-[selected=true]:bg-transparent",
              "!text-default-500",
              "pt-px",
              "px-0",
              "mx-0",
            ],
            classNames?.wrapper
          ),
        })}
      >
        {!isSelected || isSSR ? <Sun size={22} /> : <Moon size={22} />}
      </div>
    </Component>
  )
}
