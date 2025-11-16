import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Code, Eye, RefreshCw } from 'lucide-react';

interface EmailPreviewProps {
  htmlContent: string;
  subject: string;
  variables?: Record<string, any>;
}

export const EmailPreview: React.FC<EmailPreviewProps> = ({
  htmlContent,
  subject,
  variables = {}
}) => {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const [processedHtml, setProcessedHtml] = useState('');

  useEffect(() => {
    // Remplacer les variables dans le HTML
    let processed = htmlContent;
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(regex, String(value));
    });
    setProcessedHtml(processed);
  }, [htmlContent, variables]);

  const processedSubject = Object.entries(variables).reduce(
    (acc, [key, value]) => acc.replace(new RegExp(`{{${key}}}`, 'g'), String(value)),
    subject
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Prévisualisation Email
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{viewMode === 'desktop' ? 'Desktop' : 'Mobile'}</Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'desktop' ? 'mobile' : 'desktop')}
            >
              {viewMode === 'desktop' ? (
                <Smartphone className="h-4 w-4" />
              ) : (
                <Monitor className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </TabsTrigger>
            <TabsTrigger value="html">
              <Code className="h-4 w-4 mr-2" />
              HTML
            </TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="space-y-4">
            {/* Sujet */}
            <div className="p-4 bg-muted rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Sujet:</div>
              <div className="font-semibold">{processedSubject}</div>
            </div>

            {/* Prévisualisation iframe */}
            <div className="relative border rounded-lg overflow-hidden bg-muted">
              <div
                className="transition-all duration-300"
                style={{
                  width: viewMode === 'desktop' ? '100%' : '375px',
                  margin: viewMode === 'mobile' ? '0 auto' : '0',
                }}
              >
                <iframe
                  srcDoc={processedHtml}
                  className="w-full"
                  style={{
                    height: '600px',
                    border: 'none',
                  }}
                  title="Email Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            </div>

            {/* Variables utilisées */}
            {Object.keys(variables).length > 0 && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <div className="text-sm font-semibold mb-2">Variables utilisées:</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(variables).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <code className="px-2 py-1 bg-background rounded text-xs">
                        {`{{${key}}}`}
                      </code>
                      <span className="text-muted-foreground">→</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="html">
            <div className="relative">
              <pre className="p-4 bg-muted rounded-lg overflow-x-auto text-xs">
                <code>{processedHtml}</code>
              </pre>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  navigator.clipboard.writeText(processedHtml);
                }}
              >
                Copier
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
