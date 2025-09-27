import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Library() {
  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Library</h1>
          <p className="text-muted-foreground">Browse medical content and resources</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Library Content</CardTitle>
          <CardDescription>Medical content library coming soon...</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            The medical library will contain educational content, study materials, and resources for medical learning.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}