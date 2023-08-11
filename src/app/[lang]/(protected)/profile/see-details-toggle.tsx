import ProfileDetails from "@/components/profile/profile-details"
import UserActiveSessions from "@/components/profile/sessions/user-active-sessions"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { TDictionary } from "@/lib/langs"

export default function SeeDetailsToggle({ dictionary }: { dictionary: TDictionary }) {
  return (
    <div className="-mt-4 rounded-b-lg border bg-card p-2 pt-6 text-muted-foreground shadow-sm">
      <Accordion type="single" collapsible>
        <AccordionItem value="session-toggle" className="border-b-0">
          <AccordionTrigger className="flex-none gap-1 p-0">
            {dictionary.profilePage.profileDetails.toggle}
          </AccordionTrigger>
          <AccordionContent>
            <UserActiveSessions dictionary={dictionary} />
            <ProfileDetails dictionary={dictionary} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
