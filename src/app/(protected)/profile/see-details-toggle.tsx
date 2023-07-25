"use client"

import { useState } from "react"
import UserActiveSessions from "@/components/auth/user-active-sessions"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SeeDetailsToggle() {
  const [showDetails, setShowDetails] = useState<string | undefined>()

  return (
    <div className="-z-10 -translate-y-4 rounded-b-lg border bg-card p-2 pt-6 text-muted-foreground shadow-sm">
      <Accordion type="single" collapsible value={showDetails} onValueChange={setShowDetails}>
        <AccordionItem value="session-toggle" className="border-b-0">
          <AccordionTrigger className="flex-none gap-1">See details</AccordionTrigger>
          <AccordionContent>
            <UserActiveSessions />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
