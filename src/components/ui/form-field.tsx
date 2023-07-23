import { HTMLInputTypeAttribute } from "react"
import { ControllerRenderProps, FieldPath, FieldValues, UseFormReturn } from "react-hook-form"
import {
  FormControl,
  FormDescription,
  FormField as FormFieldComponent,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PasswordEyeSlash } from "@/components/ui/password-eye-slash"
import { cn } from "@/lib/utils"

export type InputWithOmittedProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "form" | "type" | "defaultValue" | "id"
>

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> extends InputWithOmittedProps {
  form: UseFormReturn<TFieldValues>
  name: TName
  label?: string
  placeholder?: string
  description?: string
  type?: HTMLInputTypeAttribute | "role-box" | "password"
  autoComplete?: string
  className?: string
}

function getInner<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>(
  {
    field,
    autoComplete,
    placeholder,
    type,
  }: // form,
  FormFieldProps<TFieldValues> & { field: ControllerRenderProps<TFieldValues, TName> },
  props: InputWithOmittedProps
) {
  if (type === "password-eye-slash") {
    return <PasswordEyeSlash placeholder={placeholder} autoComplete={autoComplete} {...props} {...field} />
  } else {
    return <Input placeholder={placeholder} type={type} autoComplete={autoComplete} {...props} {...field} />
  }
}

export default function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({
  form,
  name,
  label,
  placeholder,
  description,
  type,
  autoComplete,
  className,
  ...props
}: FormFieldProps<TFieldValues, TName>) {
  return (
    <FormFieldComponent
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn(className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            {getInner(
              {
                field,
                form,
                name,
                label,
                placeholder,
                description,
                type,
                autoComplete,
              },
              props
            )}
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
