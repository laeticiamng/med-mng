import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, TrendingUp, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

export default function PostsFeed() {
  const [filter, setFilter] = useState<'recent' | 'trending' | 'following'>('recent');

  const posts = [
    {
      id: 1,
      author: {
        name: 'Sophie Martin',
        username: 'sophie_m',
        avatar: null,
      },
      content: 'Incroyable! J\'ai réussi à maintenir ma série de 100 jours de méditation quotidienne. C\'est fou comme cette pratique a transformé ma vie. Je me sens plus calme, plus concentré et plus heureux. 🧘‍♀️✨',
      tags: ['meditation', 'wellness', '100days'],
      timestamp: '2h',
      likes: 142,
      comments: 28,
      shares: 15,
      isLiked: false,
      isBookmarked: false,
    },
    {
      id: 2,
      author: {
        name: 'Marc Dubois',
        username: 'marc_d',
        avatar: null,
      },
      content: 'Nouveau record personnel sur le challenge "Focus Deep Work" - 4h de travail concentré sans interruption! 🎯 Mes conseils: désactiver les notifs, musique lo-fi, et des pauses Pomodoro bien planifiées.',
      tags: ['focus', 'productivity', 'challenge'],
      timestamp: '5h',
      likes: 89,
      comments: 12,
      shares: 8,
      isLiked: true,
      isBookmarked: false,
    },
    {
      id: 3,
      author: {
        name: 'Emma Laurent',
        username: 'emma_l',
        avatar: null,
      },
      content: 'Ma routine matinale qui a changé ma vie:\n1. Méditation 10 min ☀️\n2. Journal gratitude 📝\n3. Lecture 20 min 📚\n4. Étirements 5 min 🧘\n\nDémarrez votre journée du bon pied!',
      tags: ['routine', 'morning', 'wellness'],
      timestamp: '1d',
      likes: 256,
      comments: 45,
      shares: 32,
      isLiked: false,
      isBookmarked: true,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Fil de Posts | Med-Mng</title>
        <meta name="description" content="Découvrez et partagez avec la communauté Med-Mng" />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Posts de la Communauté
              </h1>
              <p className="text-lg text-gray-600">
                Partagez vos expériences et découvrez celles des autres
              </p>
            </div>
            <Link to={ROUTE_PATHS.postsNew}>
              <Button size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Post
              </Button>
            </Link>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <Button
              variant={filter === 'recent' ? 'default' : 'outline'}
              onClick={() => setFilter('recent')}
            >
              <Clock className="w-4 h-4 mr-2" />
              Récents
            </Button>
            <Button
              variant={filter === 'trending' ? 'default' : 'outline'}
              onClick={() => setFilter('trending')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Tendances
            </Button>
            <Button
              variant={filter === 'following' ? 'default' : 'outline'}
              onClick={() => setFilter('following')}
            >
              Abonnements
            </Button>
          </div>

          {/* Posts */}
          <div className="space-y-6">
            {posts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Link to={`/users/${post.author.username}`}>
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={post.author.avatar || undefined} />
                          <AvatarFallback>
                            {post.author.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                      <div>
                        <Link to={`/users/${post.author.username}`}>
                          <span className="font-semibold text-gray-900 hover:underline">
                            {post.author.name}
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <span>@{post.author.username}</span>
                          <span>·</span>
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Link to={ROUTE_PATHS.postDetail.replace(':postId', post.id.toString())}>
                    <p className="text-gray-900 mb-4 whitespace-pre-line hover:text-gray-700 transition-colors cursor-pointer">
                      {post.content}
                    </p>
                  </Link>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-6 text-gray-500">
                    <button
                      className={`flex items-center gap-2 transition-colors ${
                        post.isLiked ? 'text-red-600' : 'hover:text-red-600'
                      }`}
                    >
                      <Heart className={`w-5 h-5 ${post.isLiked ? 'fill-current' : ''}`} />
                      <span className="text-sm font-medium">{post.likes}</span>
                    </button>
                    <Link to={ROUTE_PATHS.postDetail.replace(':postId', post.id.toString())}>
                      <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{post.comments}</span>
                      </button>
                    </Link>
                    <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm font-medium">{post.shares}</span>
                    </button>
                    <button
                      className={`ml-auto transition-colors ${
                        post.isBookmarked ? 'text-blue-600' : 'hover:text-blue-600'
                      }`}
                    >
                      <Bookmark className={`w-5 h-5 ${post.isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <Button variant="outline" size="lg">
              Charger plus de posts
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
