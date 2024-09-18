import { Store } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { RouterOutputs } from "@/lib/trpc/utils"
import { Input } from "@nextui-org/input"

import Header from "./ui/header"
import ItemCard from "./ui/item-card"
import { ChooseStoreDr } from "./choose-store.dr"

export default function ChooseStore({
  dictionary,
  stores,
  isLoading,
  search,
  setSearch,
  lnk,
}: {
  dictionary: TDictionary<typeof ChooseStoreDr>
  stores: RouterOutputs["stores"]["getStores"] | undefined
  isLoading: boolean
  search: string
  setSearch: (search: string) => void
  lnk: string
}) {
  return (
    <>
      <Header
        title={dictionary.selectStore}
        dictionary={dictionary}
        actions={<Input value={search} onValueChange={setSearch} placeholder={dictionary.search} />}
      />
      <ul className="flex flex-1 flex-col gap-2">
        {isLoading
          ? [...Array(5)].map((_, i) => <ItemCard key={i} isLoading id="" title="" description="" />)
          : stores?.stores.map((store) => (
              <ItemCard
                key={store.uid}
                id={store.uid}
                title={store.name}
                description={dictionary.storeVersion + ": " + store.version}
                href={`${lnk}?storeName=${store.name}&storeVersion=${store.version}`}
                endContent={<Store className="absolute right-2 top-2 size-4 text-primary" />}
              />
            ))}
      </ul>
    </>
  )
}
