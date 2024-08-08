import { TConfiguration } from "@/api/configuration/schemas"

let configuration: TConfiguration = {
  // TODO Reset
  name: "test",
  plugins: [
    {
      name: "turbo/default",
      path: "turbo.json",
      config: {
        name: "default",
        description: "Default turbo configuration",
        suggestedPath: "turbo.json",
      },
    },
    {
      name: "devcontainer/default",
      config: {
        name: "default",
        description: "Default devcontainer configuration",
        suggestedPath: ".devcontainer",
      },
    },
  ],
}

export const getConfiguration = () => configuration

export const setConfiguration = (newConfiguration: TConfiguration) => {
  configuration = newConfiguration
}
