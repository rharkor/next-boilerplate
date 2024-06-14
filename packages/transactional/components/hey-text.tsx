import { Text } from "@react-email/components"

export default function HeyText({ heyText, name }: { heyText: string; name: string }) {
  return (
    <Text style={text}>
      {heyText} <strong>{name}</strong>!
    </Text>
  )
}

const text = {
  margin: "0 0 10px 0",
  textAlign: "left",
} as const
