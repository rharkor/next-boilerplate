"use client"

import { Dispatch, SetStateAction } from "react"
import { TDictionary } from "@/lib/langs"
import { logger } from "@/lib/logger"
import { cn } from "@/lib/utils"
import { Button } from "./button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Icons } from "../icons"

interface PaginationProps {
  dictionary: TDictionary
  isLoading: boolean
  currentNumberOfItems?: number
  currentPage?: number
  setCurrentPage?: Dispatch<SetStateAction<number>>
  totalPages?: number
  itemsPerPage?: number
  setItemsPerPage?: Dispatch<SetStateAction<number>>
  show?: boolean
}

export default function Pagination({
  dictionary,
  isLoading,
  currentNumberOfItems,
  currentPage,
  setCurrentPage,
  totalPages,
  itemsPerPage,
  setItemsPerPage,
  show = true,
}: PaginationProps) {
  //? If there are no items, and we're not on the first page, go to the first page
  if (!isLoading && currentNumberOfItems === 0 && (currentPage ?? 1) > 1) {
    logger.debug("Pagination: No items, going to first page")
    setCurrentPage?.(1)
  }

  return (
    <div className={cn("grid grid-rows-[0fr] transition-all duration-300 ease-out", show && "grid-rows-[1fr]")}>
      <div className="ml-auto flex items-center justify-between overflow-hidden px-2">
        <div className="flex items-center space-x-6 lg:space-x-8">
          {itemsPerPage && setItemsPerPage && (
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium">{dictionary.pagination.rowsPerPage}</p>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(value) => {
                  setItemsPerPage(parseInt(value, 10))
                  setCurrentPage?.(1)
                }}
              >
                <SelectTrigger className="h-8 w-[70px]">
                  <SelectValue placeholder={itemsPerPage.toString()} />
                </SelectTrigger>
                <SelectContent side="top">
                  {[5, 10, 20].map((pageSize) => (
                    <SelectItem key={pageSize} value={pageSize.toString()}>
                      {pageSize}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            {dictionary.pagination.page} {currentPage} {dictionary.pagination.of} {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage?.(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">{dictionary.pagination.goToFirstPage}</span>
              <Icons.doubleArrowRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage?.((prev) => prev - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">{dictionary.pagination.goToPreviousPage}</span>
              <Icons.chevronRight className="h-4 w-4 rotate-180" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => setCurrentPage?.((prev) => prev + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">{dictionary.pagination.goToNextPage}</span>
              <Icons.chevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => setCurrentPage?.(totalPages ?? 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">{dictionary.pagination.goToLastPage}</span>
              <Icons.doubleArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
