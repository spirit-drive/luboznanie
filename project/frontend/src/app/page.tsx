'use client'
import { EditableText } from "@/components/EditableText/EditableText"
import { useState } from "react"

export default function Home() {
  const [text, setText] = useState('initial text')
  return (
    <div id="root">
      <EditableText value={text} onChange={setText} />
    </div>
  )
}
