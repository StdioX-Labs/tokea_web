'use client'
import { cn } from '@/lib/utils'

export default function AdminFooter() {
    return (
        <footer className={cn(
            "shrink-0 border-t bg-background",
            "px-4 py-3 sm:px-6 sm:py-4",
            "text-center text-xs sm:text-sm text-muted-foreground"
        )}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <span>© {new Date().getFullYear()} Tokea. All Rights Reserved.</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-[10px] sm:text-xs">Powered by SoldOutAfrica.</span>
            </div>
        </footer>
    )
}
