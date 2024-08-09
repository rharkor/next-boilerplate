"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export default function ItemCard({
  id,
  liRef,
  title,
  subTitle,
  actions,
  description,
  className,
  endContent,
}: {
  id: string
  liRef?: React.RefObject<HTMLLIElement>
  title: string
  subTitle?: React.ReactNode
  actions?: React.ReactNode
  description: string
  className?: string
  endContent?: React.ReactNode
}) {
  return (
    <motion.li
      layout={"position"}
      key={id}
      className={cn(
        "plugin relative flex cursor-pointer flex-col gap-2 rounded-medium bg-content2 p-3 shadow hover:bg-content2/80",
        className
      )}
      exit={{ opacity: 0, scale: 0.9 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      ref={liRef}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xl font-medium">{title}</p>
          <div className="flex flex-row items-center gap-1 text-xs text-muted-foreground">{subTitle}</div>
        </div>
        <div className="flex flex-row gap-2">{actions}</div>
      </div>
      <p className="truncate text-sm">{description}</p>
      {endContent}
    </motion.li>
  )
}
