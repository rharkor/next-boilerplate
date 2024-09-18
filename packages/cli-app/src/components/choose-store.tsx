import { Store } from "lucide-react"

import { TDictionary } from "@/lib/langs"
import { RouterOutputs } from "@/lib/trpc/utils"
import { cn } from "@/lib/utils"
import { Input } from "@nextui-org/input"
import { Spinner } from "@nextui-org/spinner"

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
  stores: RouterOutputs["stores"]["getStores"]
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
        actions={
          <Input
            value={search}
            onValueChange={setSearch}
            placeholder={dictionary.search}
            endContent={
              isLoading && (
                <Spinner
                  classNames={{
                    wrapper: "!size-4",
                  }}
                  color="current"
                  size="sm"
                />
              )
            }
            className={cn("w-64", {
              "opacity-50": isLoading,
            })}
            isReadOnly={isLoading}
          />
        }
      />
      <ul className="flex flex-1 flex-col gap-2">
        {stores.stores.map((store) => (
          <ItemCard
            key={store.uid}
            id={store.uid}
            title={store.name}
            description={dictionary.storeVersion + ": " + store.version}
            href={`${lnk}?storeName=${encodeURIComponent(store.name)}&storeVersion=${encodeURIComponent(store.version)}`}
            endContent={<Store className="absolute right-2 top-2 size-4 text-primary" />}
          />
        ))}
      </ul>
    </>
  )
}
