import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '@/config/routes'
import { useFetchFAQs } from '@/hooks/useHelp'

export default function FAQ() {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const { data: faqs = [], isLoading } = useFetchFAQs(selectedCategory, 50)

  const categories = Array.from(new Set(faqs.map((faq) => faq.category)))

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-8">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to={ROUTE_PATHS.helpCenter}>
            <Button variant="ghost" size="sm" className="mb-4">
              ← Retour au centre d'aide
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Questions fréquemment posées</h1>
          <p className="text-muted-foreground mt-2">
            Trouvez les réponses aux questions les plus courantes
          </p>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={!selectedCategory ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(undefined)}
                >
                  Tous
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* FAQs */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </>
          ) : faqs.length > 0 ? (
            faqs.map((faq) => (
              <Card
                key={faq.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setExpandedId(expandedId === faq.id ? null : faq.id)}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{faq.question}</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {faq.category}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          👍 {faq.helpful_count} personnes trouvé cela utile
                        </span>
                      </div>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 flex-shrink-0 transition-transform ${
                        expandedId === faq.id ? 'transform rotate-180' : ''
                      }`}
                    />
                  </div>

                  {expandedId === faq.id && (
                    <div className="mt-4 pt-4 border-t">
                      <div className="prose prose-invert max-w-none">
                        <p>{faq.answer}</p>
                      </div>
                      <div className="mt-4 flex gap-2 text-sm">
                        <span>Cette réponse vous a-t-elle été utile?</span>
                        <Button variant="ghost" size="sm">
                          👍 Oui
                        </Button>
                        <Button variant="ghost" size="sm">
                          👎 Non
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">Aucune FAQ trouvée</p>
              <Link to={ROUTE_PATHS.helpCenter}>
                <Button variant="outline">Retour au centre d'aide</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
