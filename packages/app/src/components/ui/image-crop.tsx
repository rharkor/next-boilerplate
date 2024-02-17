"use client"

import { ReactEventHandler, useCallback, useEffect, useRef, useState } from "react"

import { useDictionary } from "@/contexts/dictionary/utils"
import { cn } from "@/lib/utils"
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner } from "@nextui-org/react"

type TPosition = "n" | "s" | "w" | "e" | "nw" | "ne" | "sw" | "se"

export default function ImageCrop({
  originalFile,
  setFile,
  isOpen,
  onOpenChange,
}: {
  originalFile: File
  setFile: (file: File) => void
  isOpen: boolean
  onOpenChange: () => void
}) {
  const dictionary = useDictionary()

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{dictionary.cropImage}</ModalHeader>
            <CropContent onClose={onClose} originalFile={originalFile} setFile={setFile} onOpenChange={onOpenChange} />
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

function CropContent({
  onClose,
  originalFile,
  setFile,
  onOpenChange,
}: {
  onClose: () => void
  originalFile: File
  setFile: (file: File) => void
  onOpenChange: () => void
}) {
  const dictionary = useDictionary()

  const [isTouched, setIsTouched] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const imageRef = useRef<HTMLImageElement | null>(null)
  function cropImage() {
    if (isProcessing) {
      return
    }
    setIsProcessing(true)
    if (imageRef.current === null) {
      return
    }
    const cropData = cropDataRef.current
    if (cropData === null) {
      return
    }
    const { x, y, width, height } = cropData
    const intrinsicWidth = imageRef.current.naturalWidth
    const ratio = intrinsicWidth / imageRef.current.width
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")
    if (ctx === null) {
      return
    }
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.drawImage(
      imageRef.current,
      x * ratio,
      y * ratio,
      width * ratio,
      height * ratio,
      0,
      0,
      width * ratio,
      height * ratio
    )
    canvas.toBlob((blob) => {
      if (blob === null) {
        return
      }
      const file = new File([blob], originalFile.name, { type: blob.type })
      setFile(file)
      onOpenChange()
      // Reset all states
      setInitialData(null)
      setIsTouched(false)
      setCropData(null)
      setOriginalFileUrl(undefined)
      setIsProcessing(false)
    }, originalFile.type)
  }

  const [isImageLoading, setIsImageLoading] = useState(false)
  const [initialData, setInitialData] = useState<{ x: number; y: number; width: number; height: number } | null>(null)
  const cropDataRef = useRef<{ x: number; y: number; width: number; height: number } | null>(null)
  const areaRef = useRef<HTMLDivElement | null>(null)
  const dotsRef = useRef<{ [position: string]: HTMLDivElement }>({})

  const setCropData = useCallback((data: { x: number; y: number; width: number; height: number } | null) => {
    cropDataRef.current = data
    if (data === null) {
      return
    }
    if (areaRef.current !== null) {
      areaRef.current.style.top = data.y + "px"
      areaRef.current.style.left = data.x + "px"
      areaRef.current.style.width = data.width + "px"
      areaRef.current.style.height = data.height + "px"
      areaRef.current.style.backgroundPosition = `-${data.x}px -${data.y}px`
    }
    if (dotsRef.current.nw !== undefined) {
      dotsRef.current.nw.style.top = data.y + "px"
      dotsRef.current.nw.style.left = data.x + "px"
    }
    if (dotsRef.current.ne !== undefined) {
      dotsRef.current.ne.style.top = data.y + "px"
      dotsRef.current.ne.style.left = data.x + data.width + "px"
    }
    if (dotsRef.current.sw !== undefined) {
      dotsRef.current.sw.style.top = data.y + data.height + "px"
      dotsRef.current.sw.style.left = data.x + "px"
    }
    if (dotsRef.current.se !== undefined) {
      dotsRef.current.se.style.top = data.y + data.height + "px"
      dotsRef.current.se.style.left = data.x + data.width + "px"
    }
    if (dotsRef.current.n !== undefined) {
      dotsRef.current.n.style.top = data.y + "px"
      dotsRef.current.n.style.left = data.x + data.width / 2 + "px"
    }
    if (dotsRef.current.s !== undefined) {
      dotsRef.current.s.style.top = data.y + data.height + "px"
      dotsRef.current.s.style.left = data.x + data.width / 2 + "px"
    }
    if (dotsRef.current.w !== undefined) {
      dotsRef.current.w.style.top = data.y + data.height / 2 + "px"
      dotsRef.current.w.style.left = data.x + "px"
    }
    if (dotsRef.current.e !== undefined) {
      dotsRef.current.e.style.top = data.y + data.height / 2 + "px"
      dotsRef.current.e.style.left = data.x + data.width + "px"
    }
  }, [])

  //* IMAGE BASE SIZE
  const handleMountImage = useCallback((node: HTMLImageElement | null) => {
    if (node !== null) {
      imageRef.current = node
      setIsImageLoading(true)
    }
  }, [])
  const handleImageLoaded: ReactEventHandler<HTMLImageElement> = useCallback(
    (e) => {
      const { width, height } = e.currentTarget
      //? Sub pixels trick
      // The image probably has a decimal width or height, which causes the crop area to be off by a few pixels.
      // To fix this, we round the width and height to the nearest integer. and assign it to the image again.
      const rWidth = Math.round(width)
      const rHeight = Math.round(height)
      e.currentTarget.style.width = rWidth.toString() + "px"
      e.currentTarget.style.height = rHeight.toString() + "px"
      e.currentTarget.width = rWidth
      e.currentTarget.height = rHeight
      setCropData({ x: 0, y: 0, width: rWidth, height: rHeight })
      setInitialData({ x: 0, y: 0, width: rWidth, height: rHeight })
      if (areaRef.current) {
        areaRef.current.style.backgroundSize = `${rWidth}px ${rHeight}px`
      }
      setIsImageLoading(false)
    },
    [setCropData]
  )

  //* IMAGE URL
  const [originalFileUrl, setOriginalFileUrl] = useState<string>()
  useEffect(() => {
    setOriginalFileUrl(URL.createObjectURL(originalFile))
  }, [originalFile])

  //* CROP AREA
  const minHeight = 50
  const minWidth = 50
  const handleMouseDown = useCallback(
    (position: TPosition) => (e: MouseEvent) => {
      const cropData = cropDataRef.current
      if (cropData === null || initialData === null) {
        return
      }
      const { x, y, width, height } = cropData
      const startX = e.pageX
      const startY = e.pageY
      const startWidth = width
      const startHeight = height
      const handleMouseMove = (e: MouseEvent) => {
        const currentX = e.pageX
        const currentY = e.pageY
        let deltaX = currentX - startX
        let deltaY = currentY - startY
        let newCropData = { x, y, width, height }
        switch (position) {
          case "n":
            if (y + deltaY < 0) {
              deltaY = -y
            }
            if (startHeight - deltaY < minHeight) {
              deltaY = startHeight - minHeight
            }
            newCropData = { x, y: y + deltaY, width, height: startHeight - deltaY }
            break
          case "s":
            if (y + height + deltaY > initialData.height) {
              deltaY = initialData.height - y - height
            }
            if (startHeight + deltaY < minHeight) {
              deltaY = minHeight - startHeight
            }
            newCropData = { x, y, width, height: startHeight + deltaY }
            break
          case "w":
            if (x + deltaX < 0) {
              deltaX = -x
            }
            if (startWidth - deltaX < minWidth) {
              deltaX = startWidth - minWidth
            }
            newCropData = { x: x + deltaX, y, width: startWidth - deltaX, height }
            break
          case "e":
            if (x + width + deltaX > initialData.width) {
              deltaX = initialData.width - x - width
            }
            if (startWidth + deltaX < minWidth) {
              deltaX = minWidth - startWidth
            }
            newCropData = { x, y, width: startWidth + deltaX, height }
            break
          case "nw":
            if (x + deltaX < 0) {
              deltaX = -x
            }
            if (y + deltaY < 0) {
              deltaY = -y
            }
            if (startWidth - deltaX < minWidth) {
              deltaX = startWidth - minWidth
            }
            if (startHeight - deltaY < minHeight) {
              deltaY = startHeight - minHeight
            }
            newCropData = { x: x + deltaX, y: y + deltaY, width: startWidth - deltaX, height: startHeight - deltaY }
            break
          case "ne":
            if (x + width + deltaX > initialData.width) {
              deltaX = initialData.width - x - width
            }
            if (y + deltaY < 0) {
              deltaY = -y
            }
            if (startWidth + deltaX < minWidth) {
              deltaX = minWidth - startWidth
            }
            if (startHeight - deltaY < minHeight) {
              deltaY = startHeight - minHeight
            }
            newCropData = { x, y: y + deltaY, width: startWidth + deltaX, height: startHeight - deltaY }
            break
          case "sw":
            if (x + deltaX < 0) {
              deltaX = -x
            }
            if (y + height + deltaY > initialData.height) {
              deltaY = initialData.height - y - height
            }
            if (startWidth - deltaX < minWidth) {
              deltaX = startWidth - minWidth
            }
            if (startHeight + deltaY < minHeight) {
              deltaY = minHeight - startHeight
            }
            newCropData = { x: x + deltaX, y, width: startWidth - deltaX, height: startHeight + deltaY }
            break
          case "se":
            if (x + width + deltaX > initialData.width) {
              deltaX = initialData.width - x - width
            }
            if (y + height + deltaY > initialData.height) {
              deltaY = initialData.height - y - height
            }
            if (startWidth + deltaX < minWidth) {
              deltaX = minWidth - startWidth
            }
            if (startHeight + deltaY < minHeight) {
              deltaY = minHeight - startHeight
            }
            newCropData = { x, y, width: startWidth + deltaX, height: startHeight + deltaY }
            break
        }
        //? Prevent crop area from going out of bounds
        if (newCropData.x < 0) {
          newCropData.x = 0
        }
        if (newCropData.y < 0) {
          newCropData.y = 0
        }
        if (newCropData.x + newCropData.width > initialData.width) {
          newCropData.width = initialData.width - newCropData.x
        }
        if (newCropData.y + newCropData.height > initialData.height) {
          newCropData.height = initialData.height - newCropData.y
        }
        if (newCropData.width < minWidth) {
          newCropData.width = minWidth
        }
        if (newCropData.height < minHeight) {
          newCropData.height = minHeight
        }

        setCropData(newCropData)
        setIsTouched(true)
      }
      const handleMouseUp = () => {
        document.removeEventListener("pointermove", handleMouseMove)
        document.removeEventListener("pointerup", handleMouseUp)
      }
      document.addEventListener("pointermove", handleMouseMove)
      document.addEventListener("pointerup", handleMouseUp)
    },
    [initialData, setCropData]
  )
  const registerDot = useCallback(
    (position: TPosition) => (node: HTMLDivElement | null) => {
      if (node !== null) {
        dotsRef.current[position] = node
        node.addEventListener("pointerdown", handleMouseDown(position))
      }

      return () => {
        if (node !== null) {
          node.removeEventListener("pointerdown", handleMouseDown(position))
        }
      }
    },
    [handleMouseDown]
  )
  const handleAreaMouseDown = useCallback(
    (e: MouseEvent) => {
      const cropData = cropDataRef.current
      if (cropData === null || initialData === null) {
        return
      }
      const { x, y } = cropData
      const startX = e.pageX
      const startY = e.pageY
      const handleMouseMove = (e: MouseEvent) => {
        const currentX = e.pageX
        const currentY = e.pageY
        const deltaX = currentX - startX
        const deltaY = currentY - startY
        const newCropData = { x: x + deltaX, y: y + deltaY, width: cropData.width, height: cropData.height }
        //? Prevent crop area from going out of bounds
        if (newCropData.x < 0) {
          newCropData.x = 0
        }
        if (newCropData.y < 0) {
          newCropData.y = 0
        }
        if (newCropData.x + newCropData.width > initialData.width) {
          newCropData.x = initialData.width - newCropData.width
        }
        if (newCropData.y + newCropData.height > initialData.height) {
          newCropData.y = initialData.height - newCropData.height
        }
        setCropData(newCropData)
      }
      const handleMouseUp = () => {
        document.removeEventListener("pointermove", handleMouseMove)
        document.removeEventListener("pointerup", handleMouseUp)
      }
      document.addEventListener("pointermove", handleMouseMove)
      document.addEventListener("pointerup", handleMouseUp)
    },
    [setCropData, initialData]
  )
  const registerArea = useCallback(
    (node: HTMLDivElement | null) => {
      if (node !== null) {
        areaRef.current = node
        node.addEventListener("pointerdown", handleAreaMouseDown)
      }

      return () => {
        if (node !== null) {
          node.removeEventListener("pointerdown", handleAreaMouseDown)
        }
      }
    },
    [handleAreaMouseDown]
  )

  return (
    <>
      <ModalBody className="flex items-center justify-center">
        <div className="relative flex size-[500px] max-h-[100%] max-w-[100%] items-center justify-center overflow-hidden">
          <div className="relative flex select-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={originalFileUrl}
              alt="Original file"
              className="pointer-events-none size-max max-h-[478px] max-w-[478px] select-none object-contain"
              ref={handleMountImage}
              onLoad={handleImageLoaded}
              draggable={false}
              unselectable="on"
            />
            {/* DARK LAYER */}
            <div
              className={cn("absolute inset-0 bg-black/50", {
                invisible: isImageLoading,
              })}
            />
            {/* CROP AREA */}
            <div
              className={cn("outline-primary absolute cursor-move outline outline-[3px]", {
                invisible: isImageLoading,
              })}
              style={{
                backgroundImage: originalFileUrl && `url(${originalFileUrl})`,
              }}
              ref={registerArea}
            />
            {/* DOT1 | TOP-LEFT */}
            <div
              className={cn(
                "bg-primary absolute left-0 top-0 h-4 w-4 translate-x-[calc(-50%-1.5px)] translate-y-[calc(-50%-1.5px)] cursor-nw-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("nw")}
            />
            {/* DOT2 | TOP-RIGHT */}
            <div
              className={cn(
                "bg-primary absolute right-0 top-0 h-4 w-4 translate-x-[calc(-50%+1.5px)] translate-y-[calc(-50%-1.5px)] cursor-ne-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("ne")}
            />
            {/* DOT3 | BOTTOM-LEFT */}
            <div
              className={cn(
                "bg-primary absolute bottom-0 left-0 h-4 w-4 translate-x-[calc(-50%-1.5px)] translate-y-[calc(-50%+1.5px)] cursor-sw-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("sw")}
            />
            {/* DOT4 | BOTTOM-RIGHT */}
            <div
              className={cn(
                "bg-primary absolute bottom-0 right-0 h-4 w-4 translate-x-[calc(-50%+1.5px)] translate-y-[calc(-50%+1.5px)] cursor-se-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("se")}
            />
            {/* DOT5 | TOP */}
            <div
              className={cn(
                "bg-primary absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2 translate-y-[calc(-50%-1.5px)] cursor-n-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("n")}
            />
            {/* DOT6 | BOTTOM */}
            <div
              className={cn(
                "bg-primary absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-[calc(-50%+1.5px)] cursor-s-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("s")}
            />
            {/* DOT7 | LEFT */}
            <div
              className={cn(
                "bg-primary absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-[calc(-50%-1.5px)] cursor-w-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("w")}
            />
            {/* DOT8 | RIGHT */}
            <div
              className={cn(
                "bg-primary absolute right-0 top-1/2 h-4 w-4 -translate-y-1/2 translate-x-[calc(-50%+1.5px)] cursor-e-resize rounded-full",
                {
                  invisible: isImageLoading,
                }
              )}
              ref={registerDot("e")}
            />
          </div>
          {isImageLoading && (
            <div className="bg-content1/50 absolute inset-0 flex flex-col items-center justify-center gap-1">
              <Spinner color="primary" />
              <span className="text-foreground text-base font-bold">{dictionary.loading}</span>
            </div>
          )}
        </div>
      </ModalBody>
      <ModalFooter>
        <Button
          color="danger"
          variant="light"
          onPress={() => {
            if (!isTouched) {
              onClose()
              return
            } else {
              if (initialData === null) {
                return
              }
              setCropData(initialData)
              setIsTouched(false)
            }
          }}
        >
          {!isTouched ? dictionary.cancel : dictionary.reset}
        </Button>
        <Button
          color="primary"
          onPress={() => {
            cropImage()
          }}
          isLoading={isProcessing}
        >
          {dictionary.save}
        </Button>
      </ModalFooter>
    </>
  )
}
