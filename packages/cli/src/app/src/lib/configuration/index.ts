import { TConfiguration } from "@/api/configuration/schemas"

let configuration: TConfiguration = {
  // TODO Reset
  name: "test",
  plugins: [
    {
      name: "Default turbo configuration",
      description: "Basic steps configuration for turbo (build, lint, dev, ...)",
      suggestedPath: "turbo.json",
      sourcePath: "turbo/default",
      id: "turbo/default",
    },
    {
      name: "Default devcontainer configuration",
      description: "Open VS Code in a linux container",
      suggestedPath: ".devcontainer",
      sourcePath: "devcontainer/default",
      id: "devcontainer/default",
      outputPath: ".devcontainer",
    },
  ],
}

export const getConfiguration = () => configuration

export const setConfiguration = (newConfiguration: TConfiguration) => {
  configuration = newConfiguration
}
