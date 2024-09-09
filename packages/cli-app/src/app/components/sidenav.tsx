import React, { useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import { motion, useAnimation } from "framer-motion"

import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { cn } from "@/lib/utils"

import { SidenavDr } from "./sidenav.dr"

export default function Sidenav({
  dictionary,
  ssrConfiguration,
}: {
  dictionary: TDictionary<typeof SidenavDr>
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
}) {
  const pathname = usePathname()
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const animate = useAnimation()
  useEffect(() => {
    if ((configuration.data.configuration.plugins?.length ?? 0) > 0) {
      animate.start({
        scale: 1.5,
        opacity: 0,
        transition: {
          duration: 0.5,
        },
      })
    }
  }, [configuration.data.configuration.plugins?.length, animate])

  return (
    <nav className="w-[250px] shrink-0">
      <ul className="flex flex-col gap-2 rounded-medium">
        <Item
          href="/"
          isCurrent={pathname === "/"}
          afterContent={
            (configuration.data.configuration.plugins?.length ?? 0) > 0 ? (
              <div className="relative">
                <motion.span animate={animate} className="absolute inset-0 rounded-full bg-primary" />
                <span className="relative z-10 flex size-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {configuration.data.configuration.plugins?.length}
                </span>
              </div>
            ) : null
          }
        >
          {dictionary.configuration}
        </Item>
        <Item href="/templates" isCurrent={pathname === "/templates"}>
          {dictionary.templates}
        </Item>
        <Item href="/plugins" isCurrent={pathname === "/plugins"}>
          {dictionary.plugins}
        </Item>
      </ul>
    </nav>
  )
}

function Item({
  children,
  href,
  isCurrent,
  afterContent,
}: {
  children: React.ReactNode
  isCurrent: boolean
  href: string
  afterContent?: React.ReactNode
}) {
  return (
    <li>
      <Link
        className={cn(
          "flex cursor-pointer items-center justify-between gap-2 rounded-medium px-5 py-2 font-medium uppercase hover:bg-content2",
          {
            "bg-content1": isCurrent,
          }
        )}
        href={href}
      >
        {children}
        {afterContent}
      </Link>
    </li>
  )
}
