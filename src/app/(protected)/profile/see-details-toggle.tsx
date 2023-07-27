import ProfileDetails from "@/components/profile/profile-details"
import UserActiveSessions from "@/components/profile/sessions/user-active-sessions"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function SeeDetailsToggle() {
  return (
    <div className="-mt-4 rounded-b-lg border bg-card p-2 pt-6 text-muted-foreground shadow-sm">
      <Accordion type="single" collapsible>
        <AccordionItem value="session-toggle" className="border-b-0">
          <AccordionTrigger className="flex-none gap-1 p-0">See details</AccordionTrigger>
          <AccordionContent>
            <UserActiveSessions />
            <ProfileDetails />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
