import React, { useState } from 'react';
import { Users, MessageCircle, Trophy, Plus, Heart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Helmet } from 'react-helmet-async';

export const Community = () => {
  const [posts] = useState([
    {
      id: '1',
      author: { name: 'Dr. Sarah Martin', level: '6ème année' },
      content: 'Vient de terminer tous les items de cardiologie ! 🎉',
      timestamp: new Date(),
      likes: 24,
      comments: 8,
      isLiked: false
    }
  ]);

  return (
    <>
      <Helmet>
        <title>Communauté - MED-MNG</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Communauté</h1>
              <p className="text-muted-foreground">Connectez-vous avec d'autres étudiants</p>
            </div>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nouveau post
          </Button>
        </div>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="feed">Fil d'actualité</TabsTrigger>
            <TabsTrigger value="leaderboard">Classement</TabsTrigger>
          </TabsList>

          <TabsContent value="feed" className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardContent className="pt-6">
                  <div className="flex gap-4">
                    <Avatar>
                      <AvatarFallback>SM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{post.author.name}</h3>
                        <Badge variant="secondary">{post.author.level}</Badge>
                      </div>
                      <p className="mb-4">{post.content}</p>
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm">
                          <Heart className="h-4 w-4 mr-1" />
                          {post.likes}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MessageCircle className="h-4 w-4 mr-1" />
                          {post.comments}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="leaderboard">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Classement mensuel
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { rank: 1, name: 'Thomas Chen', points: 12450 },
                    { rank: 2, name: 'Emma Laurent', points: 11890 },
                    { rank: 3, name: 'Lucas Bernard', points: 11340 }
                  ].map((entry) => (
                    <div key={entry.rank} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
                      <div className="text-2xl font-bold w-12 text-center">
                        {entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉'}
                      </div>
                      <Avatar>
                        <AvatarFallback>
                          {entry.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold">{entry.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{entry.points.toLocaleString()} pts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Community;