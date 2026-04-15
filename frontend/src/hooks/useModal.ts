import { useState } from 'react'

export function useModal() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)

  function openModal()    { setOpen(true);  setMinimized(false) }
  function closeModal()   { setOpen(false); setMinimized(false) }
  function toggleMinimize() { setMinimized(v => !v) }

  return { open, minimized, openModal, closeModal, toggleMinimize }
}
