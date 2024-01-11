"use client"

import { InputHTMLAttributes, useEffect, useState } from "react"
import { Upload } from "lucide-react"
import { Accept, useDropzone } from "react-dropzone"

import { useDictionary } from "@/contexts/dictionary/utils"
import { bytesToMegabytes, cn } from "@/lib/utils"
import { Button } from "@nextui-org/react"

import { Icons } from "../icons"

export type TFileUploadProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onFilesChange" | "dictionary" | "disabled" | "accept"
> & {
  className?: string
  onFilesChange?: (files: File[]) => void
  disabled?: boolean
  accept?: Accept //? See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  maxFiles?: number
}

export default function FileUpload({
  className,
  onFilesChange,
  disabled,
  accept,
  maxFiles,
  ...props
}: TFileUploadProps) {
  const dictionary = useDictionary()
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept,
    maxFiles,
  })
  const [files, setFiles] = useState<File[]>([])
  useEffect(() => {
    if (!acceptedFiles.length) return
    onFilesChange?.(acceptedFiles)
    setFiles(acceptedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles])

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onFilesChange?.(newFiles)
    setFiles(newFiles)
  }

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-medium bg-muted/20 text-foreground flex h-[250px] cursor-pointer flex-col items-center justify-center gap-4 border border-dashed border-transparent p-2 px-6 transition-all",
          {
            "hover:border-primary hover:bg-muted/40 focus:border-primary focus:bg-muted/40": !disabled,
            "border-primary bg-muted/50": isDragAccept,
            "border-danger bg-danger/40": isDragReject,
          },
          className
        )}
      >
        <input type="file" {...getInputProps()} disabled={disabled} {...props} />
        <Upload className="h-12 w-12" />
        <p className="text-foreground/80 text-center text-sm">{dictionary.uploadDescription}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {files.map((file, i) => (
          <li
            className="rounded-medium border-muted-foreground/30 flex flex-row items-center justify-between gap-1 border p-1 pl-3"
            key={i}
          >
            <p className="flex flex-row overflow-hidden">
              <span className="block truncate">{file.name}</span>
              <span className="text-muted-foreground ml-1 block">({bytesToMegabytes(file.size, true)}Mo)</span>
            </p>
            <Button
              color="danger"
              className="h-[unset] min-w-0 shrink-0 rounded-full p-1"
              onPress={() => removeFile(i)}
            >
              <Icons.trash className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
