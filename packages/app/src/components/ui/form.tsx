"use client"

import { Ref, useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Controller, FieldPath, FieldValues, UseFormReturn } from "react-hook-form"

import { useDictionary } from "@/contexts/dictionary/utils"
import { cn, stringToSlug } from "@/lib/utils"
import { Checkbox, Input, InputProps, Skeleton, Tooltip } from "@nextui-org/react"

import { Icons } from "../icons"

const WithPasswordStrenghPopover = <
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  children,
  form,
  name,
  isFocused,
}: {
  children: React.ReactNode
  form: UseFormReturn<TFieldValues>
  name: TName
  isFocused: boolean
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const dictionary = useDictionary()
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
              "rounded-medium border-default-100 bg-default-50 pointer-events-none fixed z-50 flex h-max flex-col gap-2 border p-2 opacity-0 transition-opacity duration-200 ease-in-out",
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
              className={cn("rounded-medium h-2 transition-all duration-300 ease-out", {
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

type IWithPasswordStrenghProps =
  | {
      passwordStrength?: never | false
    }
  | {
      passwordStrength: true
    }

export type FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = Omit<InputProps, "form" | "name" | "tooltip" | "type" | "skeleton"> & {
  form: UseFormReturn<TFieldValues>
  name: TName //? Required
  tooltip?: string
  type: InputProps["type"] | "password-eye-slash" | "slug"
  skeleton?: boolean
} & IWithPasswordStrenghProps

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
  skeleton,
  passwordStrength,
  inputRef,
  ...props
}: FormFieldProps<TFieldValues, TName> & { inputRef?: Ref<HTMLInputElement> }) {
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
                className="text-default-400 hover:text-primary text-2xl focus:outline-none"
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
      <WithPasswordStrenghPopover form={form} name={name} isFocused={isFocused}>
        {input}
      </WithPasswordStrenghPopover>
    )
  }

  if (skeleton !== undefined) {
    input = (
      <Skeleton isLoaded={!skeleton} className="rounded-medium">
        {input}
      </Skeleton>
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
