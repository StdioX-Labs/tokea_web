'use client'
import { cn } from '@/lib/utils'

export default function AdminFooter() {
    return (
        <footer className={cn("border-t bg-background p-4 text-center text-sm text-muted-foreground")}>
            <div>© {new Date().getFullYear()} Tokea. All Rights Reserved.</div>
            <div className="text-xs mt-1">Powered by SoldOutAfrica.</div>
        </footer>
    )
}
