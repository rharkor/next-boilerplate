import "isomorphic-fetch"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Button } from "./button"

describe("Button", () => {
  it("renders a button with the correct text", () => {
    render(<Button>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeInTheDocument()
  })

  it("calls the onClick function when clicked", async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    await userEvent.click(button)
    expect(handleClick).toBeCalledTimes(1)
  })

  it("disables the button when isLoading is true", () => {
    render(<Button isLoading>Click me</Button>)
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeDisabled()
  })

  it("disables the button when disabledWhileLoading is true and isLoading is true", () => {
    render(
      <Button isLoading disabledWhileLoading>
        Click me
      </Button>
    )
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).toBeDisabled()
  })

  it("does not disable the button when disabledWhileLoading is false and isLoading is true", () => {
    render(
      <Button isLoading disabledWhileLoading={false}>
        Click me
      </Button>
    )
    const button = screen.getByRole("button", { name: /click me/i })
    expect(button).not.toBeDisabled()
  })
})
