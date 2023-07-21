import { HTMLInputTypeAttribute } from "react"
import { ControllerRenderProps, Path, UseFormReturn } from "react-hook-form"
import * as z from "zod"
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

export interface FormFieldProps<T extends z.ZodTypeAny> extends InputWithOmittedProps {
  form: UseFormReturn<z.infer<T>>
  name: Path<z.TypeOf<T>>
  label?: string
  placeholder?: string
  description?: string
  type?: HTMLInputTypeAttribute | "role-box" | "password"
  autoComplete?: string
  className?: string
}

function getInner<T extends z.ZodTypeAny>(
  { field, autoComplete, placeholder, type, form }: FormFieldProps<T> & { field: ControllerRenderProps<z.TypeOf<T>> },
  props: InputWithOmittedProps
) {
  if (type === "password") {
    return <PasswordEyeSlash placeholder={placeholder} autoComplete={autoComplete} {...props} {...field} />
  } else {
    return <Input placeholder={placeholder} type={type} autoComplete={autoComplete} {...props} {...field} />
  }
}

export default function FormField<T extends z.ZodTypeAny>({
  form,
  name,
  label,
  placeholder,
  description,
  type,
  autoComplete,
  className,
  ...props
}: FormFieldProps<T>) {
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
