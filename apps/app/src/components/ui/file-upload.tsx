"use client"

import { InputHTMLAttributes, useCallback, useEffect, useState } from "react"
import { Crop, Upload } from "lucide-react"
import { Accept, useDropzone } from "react-dropzone"

import { TDictionary } from "@/lib/langs"
import { bytesToMegabytes, cn } from "@/lib/utils"
import { Button, useDisclosure } from "@nextui-org/react"

import { Icons } from "../icons"

import { FileDr, FileUploadDr } from "./file-upload.dr"
import ImageCrop from "./image-crop"

function File({
  file,
  i,
  removeFile,
  handleCrop,
  dictionary,
}: {
  file: File
  i: number
  removeFile: (index: number) => void
  handleCrop: (index: number, file: File) => void
  dictionary: TDictionary<typeof FileDr>
}) {
  const { isOpen: isCroppingOpen, onOpen: onCroppingOpen, onOpenChange: onCroppingOpenChange } = useDisclosure()

  const setFile = useCallback(
    (file: File) => {
      handleCrop(i, file)
    },
    [handleCrop, i]
  )

  return (
    <li className="flex flex-col gap-2" key={i}>
      <div className="flex flex-row items-center justify-between gap-1 rounded-medium border border-muted-foreground/30 p-1 pl-3">
        <p className="flex flex-row overflow-hidden">
          <span className="block truncate">{file.name}</span>
          <span className="ml-1 block text-muted-foreground">({bytesToMegabytes(file.size, true)}Mo)</span>
        </p>
        <div className="flex gap-1">
          <Button color="primary" className="h-[unset] min-w-0 shrink-0 rounded-full p-1" onPress={onCroppingOpen}>
            <Crop className="size-4" />
          </Button>
          <Button color="danger" className="h-[unset] min-w-0 shrink-0 rounded-full p-1" onPress={() => removeFile(i)}>
            <Icons.trash className="size-4" />
          </Button>
        </div>
      </div>
      <ImageCrop
        originalFile={file}
        setFile={setFile}
        onOpenChange={onCroppingOpenChange}
        isOpen={isCroppingOpen}
        dictionary={dictionary}
      />
    </li>
  )
}

export type TFileUploadProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "onFilesChange" | "dictionary" | "disabled" | "accept" | "dictionary"
> & {
  className?: string
  onFilesChange?: (files: File[]) => void
  disabled?: boolean
  accept?: Accept //? See: https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
  maxFiles?: number
  dictionary: TDictionary<typeof FileUploadDr>
}

export default function FileUpload({
  className,
  onFilesChange,
  disabled,
  accept,
  maxFiles,
  dictionary,
  ...props
}: TFileUploadProps) {
  const { acceptedFiles, getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept,
    maxFiles,
  })
  const [files, setFiles] = useState<File[]>([])
  const [croppedFiles, setCroppedFiles] = useState<File[]>([])
  useEffect(() => {
    if (!acceptedFiles.length) return
    onFilesChange?.(acceptedFiles)
    setFiles(acceptedFiles)
    setCroppedFiles(acceptedFiles)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles])

  const removeFile = (index: number) => {
    const newFiles = [...files]
    newFiles.splice(index, 1)
    onFilesChange?.(newFiles)
    setFiles(newFiles)
    setCroppedFiles(newFiles)
  }

  const handleCrop = useCallback(
    async (index: number, file: File) => {
      const newFiles = [...files]
      newFiles.splice(index, 1, file)
      onFilesChange?.(newFiles)
      setCroppedFiles(newFiles)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [files]
  )

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          "flex h-[250px] cursor-pointer flex-col items-center justify-center gap-4 rounded-medium border border-dashed border-transparent bg-muted/20 p-2 px-6 text-foreground transition-all",
          {
            "hover:border-primary hover:bg-muted/40 focus:border-primary focus:bg-muted/40": !disabled,
            "border-primary bg-muted/50": isDragAccept,
            "border-danger bg-danger/40": isDragReject,
          },
          className
        )}
      >
        <input type="file" {...getInputProps()} disabled={disabled} {...props} />
        <Upload className="size-12" />
        <p className="text-center text-sm text-foreground/80">{dictionary.uploadDescription}</p>
      </div>
      <ul className="flex flex-col gap-2">
        {croppedFiles.map((file, i) => (
          <File file={file} i={i} removeFile={removeFile} handleCrop={handleCrop} key={i} dictionary={dictionary} />
        ))}
      </ul>
    </div>
  )
}
