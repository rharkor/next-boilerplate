"use client"

import Link from "next/link"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"
import { Skeleton } from "@nextui-org/skeleton"

export default function ItemCard({
  id,
  liRef,
  title,
  subTitle,
  actions,
  description,
  className,
  endContent,
  href,
  isLoading,
  notClickable,
}: {
  id: string
  liRef?: React.RefObject<HTMLLIElement>
  title: string
  subTitle?: React.ReactNode
  actions?: React.ReactNode
  description?: string
  className?: string
  endContent?: React.ReactNode
  href?: string
  isLoading?: boolean
  notClickable?: boolean
}) {
  const content = (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="min-h-7 text-xl font-medium">{title}</p>
          <div className="flex min-h-4 flex-row items-center gap-1 text-xs text-muted-foreground">{subTitle}</div>
        </div>
        <div className="flex flex-row gap-2">{actions}</div>
      </div>
      {description !== undefined && <p className="min-h-5 truncate text-sm">{description}</p>}
      {endContent}
    </>
  )

  const baseClassName = cn(
    "plugin relative flex flex-col gap-2 rounded-medium bg-content2 p-3 shadow",
    !notClickable && "cursor-pointer hover:bg-content2/80",
    className
  )

  return (
    <motion.li
      layout={"position"}
      key={id}
      className={href || isLoading ? undefined : baseClassName}
      exit={{ opacity: 0, scale: 0.9 }}
      ref={liRef}
    >
      {href ? (
        <Link href={href} className={baseClassName}>
          {content}
        </Link>
      ) : isLoading ? (
        <Skeleton className={baseClassName}>{content}</Skeleton>
      ) : (
        content
      )}
    </motion.li>
  )
}
