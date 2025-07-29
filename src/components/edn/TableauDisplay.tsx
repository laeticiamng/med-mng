import React from 'react'
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, Book, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface TableauSection {
  title: string
  content: string
  keywords?: string[]
}

interface TableauRang {
  title?: string
  sections?: TableauSection[]
}

interface TableauDisplayProps {
  tableau: TableauRang
  rang: 'A' | 'B'
  isComplete: boolean
  className?: string
}

export function TableauDisplay({ tableau, rang, isComplete, className }: TableauDisplayProps) {
  if (!tableau || !tableau.sections || tableau.sections.length === 0) {
    return (
      <Card className={cn("border-destructive/50", className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <CardTitle className="text-destructive">
              Tableau Rang {rang} - Non disponible
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Le tableau Rang {rang} n'est pas encore disponible pour cet item.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const statusIcon = isComplete ? (
    <CheckCircle className="h-5 w-5 text-green-600" />
  ) : (
    <AlertTriangle className="h-5 w-5 text-orange-500" />
  )

  const statusBadge = isComplete ? (
    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
      Complet
    </Badge>
  ) : (
    <Badge variant="destructive">
      Incomplet
    </Badge>
  )

  return (
    <Card className={cn(
      "transition-all duration-200",
      isComplete 
        ? "border-green-200 bg-green-50/30" 
        : "border-orange-200 bg-orange-50/30",
      className
    )}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {statusIcon}
            <CardTitle className="flex items-center gap-2">
              {rang === 'A' ? <Book className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
              {tableau.title || `Tableau Rang ${rang}`}
            </CardTitle>
          </div>
          {statusBadge}
        </div>
        <CardDescription>
          {tableau.sections.length} section{tableau.sections.length > 1 ? 's' : ''} de connaissances
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tableau.sections.map((section, index) => (
            <div key={index} className="border-l-4 border-l-primary/20 pl-4">
              <h4 className="font-semibold text-sm text-foreground/90 mb-2">
                {section.title}
              </h4>
              <p className="text-sm text-foreground/70 leading-relaxed">
                {section.content}
              </p>
              {section.keywords && section.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {section.keywords.slice(0, 5).map((keyword, keywordIndex) => (
                    <Badge 
                      key={keywordIndex} 
                      variant="outline" 
                      className="text-xs px-2 py-0.5"
                    >
                      {keyword}
                    </Badge>
                  ))}
                  {section.keywords.length > 5 && (
                    <Badge variant="outline" className="text-xs px-2 py-0.5">
                      +{section.keywords.length - 5}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}