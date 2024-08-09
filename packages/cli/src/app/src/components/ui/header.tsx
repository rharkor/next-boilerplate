import React from "react"

export default function Header({ title, actions }: { title: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <h1 className="text-3xl">{title}</h1>
      <div className="flex flex-row gap-2">{actions}</div>
    </div>
  )
}
