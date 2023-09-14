"use client"

import React, { useEffect, useState } from "react"

export default function AutoRefresh({ callback, interval }: { callback: () => React.ReactNode; interval: number }) {
  const [result, setResult] = useState<React.ReactNode>(callback())
  useEffect(() => {
    const intervalId = setInterval(() => {
      setResult(callback())
    }, interval)

    return () => {
      clearInterval(intervalId)
    }
  }, [callback, interval])

  return <>{result}</>
}
