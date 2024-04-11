"use client"

import { Ref, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { TDictionary } from "@/lib/langs"
import { cn, stringToSlug } from "@/lib/utils"
import { Checkbox, Input, InputProps, Tooltip } from "@nextui-org/react"

import { Icons } from "../icons"

import { FormFieldDr, WithPasswordStrengthPopoverDr } from "./form.dr"

const WithPasswordStrengthPopover = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  form,
  name,
  isFocused,
  dictionary,
}: {
  children: React.ReactNode
  form: UseFormReturn<TFieldValues>
  name: TName
  isFocused: boolean
  dictionary: TDictionary<typeof WithPasswordStrengthPopoverDr>
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const passwordValue = form.watch(name)
  //? Password strength increase with this pattern:
  // 1. Password length
  // 2. Password contains numbers
  // 3. Password contains lowercase characters
  // 4. Password contains uppercase characters
  // 5. Password contains special characters
  const passwordStrengthValue = passwordValue
    ? [
        passwordValue.length >= 8,
        numberRegex.test(passwordValue),
        lowercaseRegex.test(passwordValue),
        uppercaseRegex.test(passwordValue),
        specialRegex.test(passwordValue),
      ].filter(Boolean).length
    : 0
  const position = inputRef.current?.getBoundingClientRect()

  const updatePopoverPosition = useCallback(() => {
    if (position && popoverRef.current) {
      popoverRef.current.style.top = `${position.top + position.height + 4 - window.scrollY}px`
      popoverRef.current.style.left = `${position.left + window.scrollX}px`
    }
  }, [position])

  updatePopoverPosition()

  useEffect(() => {
    window.addEventListener("scroll", updatePopoverPosition)
    window.addEventListener("resize", updatePopoverPosition)

    return () => {
      window.removeEventListener("scroll", updatePopoverPosition)
      window.removeEventListener("resize", updatePopoverPosition)
    }
  }, [updatePopoverPosition])

  return (
    <div className="relative" ref={inputRef}>
      {children}
      {inputRef.current &&
        createPortal(
          <div
            className={cn(
              "pointer-events-none fixed z-50 flex h-max flex-col gap-2 rounded-medium border border-default-100 bg-default-50 p-2 opacity-0 transition-opacity duration-200 ease-in-out",
              {
                "pointer-events-auto opacity-100": isFocused,
              }
            )}
            style={
              position && {
                width: `${position.width}px`,
              }
            }
            ref={popoverRef}
          >
            <div
              className={cn("h-2 rounded-medium transition-all duration-300 ease-out", {
                "bg-danger-500": passwordStrengthValue < 2,
                "bg-warning": passwordStrengthValue < 5 && passwordStrengthValue >= 2,
                "bg-success": passwordStrengthValue === 5,
              })}
              style={{
                width: `${Math.max(2, (passwordStrengthValue / 5) * 100)}%`,
              }}
            />
            <ul className="flex flex-col">
              <li>
                <Checkbox isSelected={passwordValue.length >= 8} isDisabled color="success" size="sm">
                  {dictionary.min8Chars}
                </Checkbox>
              </li>
              <li>
                <Checkbox isSelected={numberRegex.test(passwordValue)} isDisabled color="success" size="sm">
                  {dictionary.containsNumber}
                </Checkbox>
              </li>
              <li>
                <Checkbox isSelected={lowercaseRegex.test(passwordValue)} isDisabled color="success" size="sm">
                  {dictionary.containsLowercase}
                </Checkbox>
              </li>
              <li>
                <Checkbox isSelected={uppercaseRegex.test(passwordValue)} isDisabled color="success" size="sm">
                  {dictionary.containsUppercase}
                </Checkbox>
              </li>
              <li>
                <Checkbox isSelected={specialRegex.test(passwordValue)} isDisabled color="success" size="sm">
                  {dictionary.containsSpecial}
                </Checkbox>
              </li>
            </ul>
          </div>,
          document.body
        )}
    </div>
  )
}

type IWithPasswordStrengthProps =
  | {
      passwordStrength?: never | false
      dictionary?: never
    }
  | {
      passwordStrength: true
      dictionary: TDictionary<typeof FormFieldDr>
    }

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<InputProps, "form" | "name" | "tooltip" | "type"> & {
  form: UseFormReturn<TFieldValues>
  name: TName //? Required
  tooltip?: string
  type: InputProps["type"] | "password-eye-slash" | "slug"
} & IWithPasswordStrengthProps

const numberRegex = /[\d]/
const lowercaseRegex = /[a-z]/
const uppercaseRegex = /[A-Z]/
const specialRegex = /[!@#$%^&*\.]/

export default function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  form,
  name,
  tooltip,
  type,
  passwordStrength,
  inputRef,
  dictionary,
  ...props
}: FormFieldProps<TFieldValues, TName> & {
  inputRef?: Ref<HTMLInputElement>
}) {
  const [isVisible, setIsVisible] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const toggleVisibility = () => setIsVisible(!isVisible)

  const typeToRealType = (type: FormFieldProps["type"]) => {
    switch (type) {
      case "password-eye-slash":
        return isVisible ? "text" : "password"
      case "slug":
        return "text"
      default:
        return type
    }
  }

  let input = (
    <Controller
      name={name}
      control={form.control}
      render={({ field }) => (
        <Input
          {...field}
          {...props}
          className={cn(
            {
              "relative z-[1]": type === "password-eye-slash",
            },
            props.className
          )}
          ref={inputRef}
          onFocusChange={setIsFocused}
          type={typeToRealType(type)}
          isInvalid={!!form.formState.errors[name]}
          errorMessage={form.formState.errors[name]?.message?.toString()}
          endContent={
            props.endContent ||
            (type === "password-eye-slash" ? (
              <button
                className="text-2xl text-default-400 hover:text-primary focus:text-primary focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <Icons.eyeSlash className="pointer-events-none transition-all" />
                ) : (
                  <Icons.eye className="pointer-events-none transition-all" />
                )}
              </button>
            ) : undefined)
          }
          onChange={type === "slug" ? (e) => field.onChange(stringToSlug(e.target.value)) : field.onChange}
        />
      )}
    />
  )

  if (passwordStrength) {
    input = (
      <WithPasswordStrengthPopover form={form} name={name} isFocused={isFocused} dictionary={dictionary}>
        {input}
      </WithPasswordStrengthPopover>
    )
  }

  if (tooltip) {
    return (
      <Tooltip content={tooltip}>
        <div className="relative">{input}</div>
      </Tooltip>
    )
  }

  return input
}
