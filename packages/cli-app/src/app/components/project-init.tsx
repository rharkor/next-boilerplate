"use client"

import { useEffect, useRef, useState } from "react"

import { motion, Variants } from "framer-motion"
import { ChevronRight } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { cn } from "@/lib/utils"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"

import { ProjectInitDr } from "./project-init.dr"

export default function ProjectInit({ dictionary }: { dictionary: TDictionary<typeof ProjectInitDr> }) {
  const variants: Variants = {
    welcome: {
      y: 0,
    },
    projectName: {
      x: "-100vw",
      y: 0,
    },
  }
  const [variant, setVariant] = useState<string>("welcome")

  const utils = trpc.useUtils()
  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const [name, setName] = useState<string>("")

  const isPending = updateConfigurationMutation.isPending
  const updateConfiguration = async () => {
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        name,
      },
    })
  }

  // Set the variant to projectName after 2 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setVariant("projectName")
    }, 2000)
    return () => clearTimeout(timeout)
  }, [])

  // Auto focus the input
  useEffect(() => {
    if (variant === "projectName") {
      nameInputRef.current?.focus()
    }
  }, [variant])

  const nameInputRef = useRef<HTMLInputElement>(null)

  const sections = [
    <Section key="welcome" variant={variant} id="welcome">
      <h1 className="text-4xl font-bold">
        {dictionary.welcomeTo} <span className="text-primary">{dictionary.app.name}</span>!
      </h1>
    </Section>,
    <Section key="projectName" variant={variant} id="projectName">
      <div className="relative flex flex-col items-center gap-2">
        <motion.h2
          className="text-4xl font-bold transition-colors"
          animate={
            variant === "projectName" && {
              fontSize: "18px",
              alignSelf: "flex-start",
              color: "hsl(var(--nextui-default-500))",
            }
          }
          transition={{
            delay: 1,
          }}
        >
          {dictionary.enterYourProjectName}
        </motion.h2>
        <div className="flex gap-2">
          <motion.input
            type="text"
            placeholder="my-app"
            className={cn("w-[250px] border-none bg-transparent text-4xl", "focus-visible:outline-none")}
            initial={{
              maxHeight: "0",
              opacity: 0,
            }}
            animate={
              variant === "projectName" && {
                maxHeight: "100px",
                opacity: 1,
              }
            }
            transition={{
              delay: 1,
              duration: 0.5,
            }}
            ref={nameInputRef}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateConfiguration()
              }
            }}
            onChange={(e) => {
              setName(e.target.value)
            }}
            value={name ?? ""}
          />
          <motion.div
            initial={{
              opacity: 0,
              x: 100,
            }}
            variants={{
              hidden: {
                opacity: 0,
                x: 100,
              },
              visible: {
                opacity: 1,
                x: 0,
              },
            }}
            animate={!name ? "hidden" : "visible"}
          >
            <Button
              onPress={() => {
                updateConfiguration()
              }}
              isDisabled={variant !== "projectName" || !name || isPending}
              className={cn("absolute -right-2 h-[40px] min-w-0 p-2")}
              color="primary"
            >
              {isPending || (name && variant !== "projectName") ? (
                <Spinner
                  classNames={{
                    wrapper: "!size-6",
                  }}
                  color="current"
                  size="sm"
                />
              ) : (
                <ChevronRight className="size-6" />
              )}
            </Button>
          </motion.div>
        </div>
      </div>
    </Section>,
  ]

  return (
    <motion.section
      className="fixed inset-0 z-50 h-screen w-screen bg-background"
      exit={{
        opacity: 0,
        y: "-100vh",
      }}
    >
      <motion.div
        className="flex"
        initial={{
          y: "100vh",
        }}
        animate={variant}
        variants={variants}
        style={{ width: "max-content" }}
        transition={{
          duration: 0.8,
          type: "spring",
        }}
      >
        {sections}
      </motion.div>
    </motion.section>
  )
}

function Section({
  children,
  className,
  variant,
  id,
}: {
  children: React.ReactNode
  className?: string
  variant: string
  id: string
}) {
  return (
    <section
      className={cn(
        "flex h-screen w-screen flex-col items-center justify-center",
        {
          "pointer-events-none": variant !== id,
        },
        className
      )}
    >
      {children}
    </section>
  )
}
