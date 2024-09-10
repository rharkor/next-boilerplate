"use client"

import { BookUp } from "lucide-react"

import Plugin from "@/app/plugins/plugin"
import Header from "@/components/ui/header"
import Section from "@/components/ui/section"
import { TDictionary } from "@/lib/langs"
import { trpc } from "@/lib/trpc/client"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Button } from "@nextui-org/button"
import { Spinner } from "@nextui-org/spinner"

import { TemplateContentDr } from "./content.dr"

type TTemplate = RouterOutputs["templates"]["getTemplate"]

export default function TemplateContent({
  id,
  dictionary,
  ssrTemplate,
  ssrConfiguration,
}: {
  id: string
  dictionary: TDictionary<typeof TemplateContentDr>
  ssrTemplate: TTemplate
  ssrConfiguration: RouterOutputs["configuration"]["getConfiguration"]
}) {
  const utils = trpc.useUtils()

  const template = trpc.templates.getTemplate.useQuery(
    {
      id,
    },
    {
      initialData: ssrTemplate,
    }
  )
  const configuration = trpc.configuration.getConfiguration.useQuery(undefined, {
    initialData: ssrConfiguration,
  })

  const updateConfigurationMutation = trpc.configuration.updateConfiguration.useMutation({
    onSuccess: async () => {
      await utils.configuration.invalidate()
    },
  })

  const replaceConfiguration = async () => {
    await updateConfigurationMutation.mutateAsync({
      configuration: {
        ...configuration.data.configuration,
        plugins: template.data.template.plugins,
      },
    })
  }

  const plugins = template.data.template.plugins

  return (
    <Section>
      <Header title={template.data.template.name} withBack dictionary={dictionary} />
      <p>{template.data.template.description}</p>
      <div className="ml-auto">
        <Button color="primary" className="h-max min-w-0 p-2" variant={"shadow"} onPress={replaceConfiguration}>
          {updateConfigurationMutation.isPending ? (
            <Spinner
              size="sm"
              classNames={{
                wrapper: "!size-6",
              }}
              color="current"
            />
          ) : (
            <BookUp className="size-6" />
          )}
          <p>{dictionary.replaceConfiguration}</p>
        </Button>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <h1 className="text-2xl">{dictionary.plugins}</h1>
        <ul className="flex flex-1 flex-col gap-2">
          {plugins.map((plugin) => (
            <Plugin key={plugin.id} plugin={plugin} dictionary={dictionary} ssrConfiguration={ssrConfiguration} />
          ))}
        </ul>
      </div>
    </Section>
  )
}
