"use client"

/**
 * Navigation Bridge
 * 
 * Re-exports the new CondorNavigation as `Navigation` so all existing 
 * pages that import { Navigation } from "@/components/navigation" 
 * automatically get the new design without any import changes.
 * 
 * The original navigation code is preserved in components/navigation.old.tsx
 */

export { CondorNavigation as Navigation } from "@/components/condor/navigation"
