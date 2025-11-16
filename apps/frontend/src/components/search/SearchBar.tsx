import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrendingSearches, useRecentSearches } from '@/hooks/useSearch'
import { ROUTE_PATHS } from '@/config/routes'
import { Input } from '@/components/ui/input'
import { Search, Zap, Clock, Loader } from 'lucide-react'

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearchChange?: (query: string) => void
}

export function SearchBar({
  placeholder = 'Rechercher...',
  className = '',
  onSearchChange,
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const navigate = useNavigate()
  const searchRef = useRef<HTMLDivElement>(null)

  const { data: trending = [], isLoading: trendingLoading } = useTrendingSearches(5)
  const { data: recent = [], isLoading: recentLoading } = useRecentSearches(5)

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      navigate(`${ROUTE_PATHS.search}?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
      setQuery('')
    }
  }

  const handleInputChange = (value: string) => {
    setQuery(value)
    onSearchChange?.(value)
    setShowSuggestions(value.length > 0 || !value)
  }

  const handleInputFocus = () => {
    setShowSuggestions(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
    }
  }

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-4"
        />
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50">
          {query ? (
            // Search suggestions for current query
            <div className="p-2">
              <button
                onClick={() => handleSearch(query)}
                className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors flex items-center gap-2 text-sm"
              >
                <Search className="h-4 w-4" />
                Rechercher "{query}"
              </button>
            </div>
          ) : (
            <>
              {/* Trending Searches */}
              {trendingLoading ? (
                <div className="p-4 flex items-center justify-center gap-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">Chargement...</span>
                </div>
              ) : trending.length > 0 ? (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase">
                    <Zap className="h-3 w-3 inline mr-2" />
                    Tendances
                  </div>
                  <div className="space-y-1 px-2">
                    {trending.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSearch(suggestion.query)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
                      >
                        {suggestion.query}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({suggestion.searchCount})
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Recent Searches */}
              {!recentLoading && recent.length > 0 && (
                <div>
                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase border-t">
                    <Clock className="h-3 w-3 inline mr-2" />
                    Récentes
                  </div>
                  <div className="space-y-1 px-2 pb-2">
                    {recent.map((search) => (
                      <button
                        key={search}
                        onClick={() => handleSearch(search)}
                        className="w-full text-left px-3 py-2 hover:bg-muted rounded-md transition-colors text-sm"
                      >
                        {search}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {trending.length === 0 && recent.length === 0 && !trendingLoading && !recentLoading && (
                <div className="p-4 text-sm text-muted-foreground text-center">
                  Aucune suggestion disponible
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
