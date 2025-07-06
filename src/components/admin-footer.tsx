'use client'
import { cn } from '@/lib/utils'

export default function AdminFooter() {
    return (
        <footer className={cn("border-t bg-background p-4 text-center text-sm text-muted-foreground")}>
            © {new Date().getFullYear()} Summer. All Rights Reserved.
        </footer>
    )
}
