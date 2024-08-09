export default function Plugin({
  params,
}: {
  params: {
    id: string
  }
}) {
  const pluginId = decodeURIComponent(params.id)
  console.log(pluginId)

  return <>Plugin page</>
}
