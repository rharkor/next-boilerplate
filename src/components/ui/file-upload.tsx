"use client"

import { Button } from "@nextui-org/react"
import { Upload } from "lucide-react"
import { InputHTMLAttributes, useEffect, useState } from "react"
import { Accept, useDropzone } from "react-dropzone"
import { TDictionary } from "@/lib/langs"
import { bytesToMegabytes, cn } from "@/lib/utils"
import { Icons } from "../icons"

export type TFileUploadProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onFilesChange" | "dictionary" | "disabled" | "accept"
> & {
  className?: string
  onFilesChange?: (files: File[]) => void
  dictionary: TDictionary
  disabled?: boolean
  accept?: Accept //? See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
}

export default function FileUpload({
  className,
  onFilesChange,
  dictionary,
  disabled,
  accept,
  ...props
}: TFileUploadProps) {
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept,
  })
  const [files, setFiles] = useState<File[]>([])

  useEffect(() => {
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
          "flex h-[250px] cursor-pointer flex-col items-center justify-center gap-4 rounded-medium border border-dashed border-transparent bg-muted/50 p-2 px-6 text-foreground transition-all",
          {
            "hover:border-primary hover:bg-muted/70 focus:border-primary focus:bg-muted/70": !disabled,
            "border-primary bg-muted/70": isDragAccept,
            "border-danger bg-danger/70": isDragReject,
          },
          className
        )}
      >
        <input type="file" {...getInputProps()} disabled={disabled} {...props} />
        <Upload className="h-12 w-12" />
        <p className="text-center text-sm text-foreground/80">{dictionary.uploadDescription}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {files.map((file, i) => (
          <li
            className="flex flex-row items-center justify-between rounded-medium border border-muted-foreground/30 p-1 pl-3"
            key={i}
          >
            <p>
              <span className="max-w-[140px] truncate">{file.name}</span>
              <span className="ml-1 text-muted-foreground">({bytesToMegabytes(file.size, true)}Mo)</span>
            </p>
            <Button color="danger" className="h-[unset] min-w-0 rounded-full p-1" onPress={() => removeFile(i)}>
              <Icons.trash className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
    </div>
  )
}
