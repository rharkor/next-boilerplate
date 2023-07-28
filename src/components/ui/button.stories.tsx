import type { Meta, StoryObj } from "@storybook/react"
import { Button } from "./button"

const meta: Meta<typeof Button> = {
  title: "Button",
  component: Button,
  argTypes: {
    children: {
      defaultValue: "Button",
      control: "text",
    },
    variant: {
      defaultValue: "default",
      control: "select",
      options: ["default", "destructive", "outline", "secondary", "ghost", "link"],
    },
    size: {
      defaultValue: "default",
      control: "select",
      options: ["sm", "lg", "icon"],
    },
    disabled: {
      defaultValue: false,
      control: "boolean",
    },
    isLoading: {
      defaultValue: false,
      control: "boolean",
    },
    onClick: {
      action: "clicked",
    },
  },
}

type Story = StoryObj<typeof Button>

export const Default: Story = {
  render: (args) => <Button {...args} />,
}

export default meta
