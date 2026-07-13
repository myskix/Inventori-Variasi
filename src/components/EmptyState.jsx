import React from 'react'
import { Inbox } from 'lucide-react'

export function EmptyState({ icon: Icon = Inbox, title = 'Tidak ada data', description = 'Belum ada data yang dapat ditampilkan.' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-muted-foreground">
      <Icon className="size-10 mb-2 opacity-20" />
      <span className="text-sm font-semibold">{title}</span>
      <span className="text-xs text-center max-w-sm">{description}</span>
    </div>
  )
}
