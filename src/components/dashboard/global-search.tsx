"use client"

import * as React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, Loader2, Package, Settings, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { globalSearch } from "@/actions/search"
import { useDebounce } from "@/hooks/use-debounce"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface SearchResult {
  id: string
  make: string
  modelNumber: string
  productName?: string | null
  cpu?: string | null
}

export function GlobalSearch() {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [results, setResults] = useState<{ products: SearchResult[], spareParts: SearchResult[] }>({ products: [], spareParts: [] })
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debouncedQuery = useDebounce(query, 300)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const allResults = [...results.products.map(p => ({ ...p, type: 'product' })), ...results.spareParts.map(s => ({ ...s, type: 'sparePart' }))]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        inputRef.current?.focus()
      }
      if (e.key === "Escape") {
        setIsOpen(false)
        inputRef.current?.blur()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    async function performSearch() {
      if (debouncedQuery.length < 2) {
        setResults({ products: [], spareParts: [] })
        setSelectedIndex(-1)
        return
      }

      setIsLoading(true)
      const data = await globalSearch(debouncedQuery)
      setResults(data)
      setIsLoading(false)
      setIsOpen(true)
      setSelectedIndex(-1)
    }

    performSearch()
  }, [debouncedQuery])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev < allResults.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault()
      const selected = allResults[selectedIndex]
      const path = selected.type === 'product' ? '/products' : '/spare-parts'
      router.push(path)
      setIsOpen(false)
    }
  }

  const clearSearch = () => {
    setQuery("")
    setResults({ products: [], spareParts: [] })
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  return (
    <div className="relative w-full max-w-md mx-2 sm:mx-4" ref={containerRef}>
      <div className="relative group">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          ) : (
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          )}
        </div>
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search everything (makes, models, CPUs...)"
          className="pl-10 pr-16 w-full bg-slate-50 border-slate-200 focus:bg-white focus:ring-4 focus:ring-blue-100 transition-all rounded-full h-10 text-sm shadow-sm"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={onKeyDown}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query ? (
            <button 
              onClick={clearSearch}
              className="p-1 hover:bg-slate-200 rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-slate-500" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-slate-100 px-1.5 font-mono text-[10px] font-medium text-slate-500 opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          )}
        </div>
      </div>

      {isOpen && (debouncedQuery.length >= 2) && (
        <div className="absolute top-full mt-2 w-[calc(100vw-2rem)] sm:w-full -left-2 sm:left-0 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="max-h-[520px] overflow-y-auto p-2">
            {isLoading && results.products.length === 0 && results.spareParts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-500/40" />
                <span className="text-sm font-medium">Searching our database...</span>
              </div>
            ) : (results.products.length === 0 && results.spareParts.length === 0) ? (
              <div className="py-12 text-center text-slate-400">
                <p className="text-sm font-medium">No results found for &quot;{debouncedQuery}&quot;</p>
                <p className="text-[10px] mt-1 italic">Try searching for a different make or model.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.products.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Package className="h-3 w-3" /> Products
                    </h3>
                    <div className="space-y-1">
                      {results.products.map((p, idx) => {
                        const globalIdx = idx
                        const isSelected = selectedIndex === globalIdx
                        return (
                          <Link
                            key={p.id}
                            href="/products"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex flex-col px-3 py-2.5 rounded-lg transition-all group",
                              isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "hover:bg-slate-50"
                            )}
                          >
                            <span className={cn(
                              "text-sm font-semibold transition-colors",
                              isSelected ? "text-white" : "text-slate-700 group-hover:text-blue-600"
                            )}>
                              {p.make} {p.modelNumber}
                            </span>
                            <span className={cn(
                              "text-[11px] font-medium transition-colors",
                              isSelected ? "text-blue-100" : "text-slate-400"
                            )}>
                              {p.productName || "Product"} • {p.cpu || "No CPU"}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {results.spareParts.length > 0 && (
                  <div>
                    <h3 className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Settings className="h-3 w-3" /> Spare Parts
                    </h3>
                    <div className="space-y-1">
                      {results.spareParts.map((sp, idx) => {
                        const globalIdx = results.products.length + idx
                        const isSelected = selectedIndex === globalIdx
                        return (
                          <Link
                            key={sp.id}
                            href="/spare-parts"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex flex-col px-3 py-2.5 rounded-lg transition-all group",
                              isSelected ? "bg-blue-600 text-white shadow-md shadow-blue-200" : "hover:bg-slate-50"
                            )}
                          >
                            <span className={cn(
                              "text-sm font-semibold transition-colors",
                              isSelected ? "text-white" : "text-slate-700 group-hover:text-blue-600"
                            )}>
                              {sp.make} {sp.modelNumber}
                            </span>
                            <span className={cn(
                              "text-[11px] font-medium transition-colors",
                              isSelected ? "text-blue-100" : "text-slate-400"
                            )}>
                              {sp.productName || "Spare Part"} • {sp.cpu || "No CPU"}
                            </span>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="bg-slate-50/80 px-4 py-2 border-t border-slate-100 flex justify-between items-center text-[10px]">
            <div className="flex items-center gap-3 text-slate-400 font-medium">
               <span className="flex items-center gap-1">
                 <kbd className="bg-white border rounded px-1 min-w-[14px] flex justify-center">↵</kbd> select
               </span>
               <span className="flex items-center gap-1">
                 <kbd className="bg-white border rounded px-1 min-w-[14px] flex justify-center">↑↓</kbd> navigate
               </span>
               <span className="flex items-center gap-1">
                 <kbd className="bg-white border rounded px-1 min-w-[14px] flex justify-center">esc</kbd> close
               </span>
            </div>
            <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {results.products.length + results.spareParts.length} Results
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
