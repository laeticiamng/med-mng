import { Helmet } from 'react-helmet-async';
import { Link, useParams } from 'react-router-dom';
import { ROUTE_PATHS } from '@/config/routes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, ArrowLeft, Send, Edit } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';

export default function PostDetail() {
  const { postId } = useParams<{ postId: string }>();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  // Mock data
  const post = {
    id: postId,
    author: {
      name: 'Sophie Martin',
      username: 'sophie_m',
      avatar: null,
      isCurrentUser: false,
    },
    content: 'Incroyable! J\'ai réussi à maintenir ma série de 100 jours de méditation quotidienne. C\'est fou comme cette pratique a transformé ma vie. Je me sens plus calme, plus concentré et plus heureux. 🧘‍♀️✨\n\nPour ceux qui veulent commencer:\n1. Commencez petit (5 min/jour)\n2. Trouvez un endroit calme\n3. Utilisez une app guidée\n4. Soyez régulier\n\nN\'abandonnez pas, les résultats viennent avec le temps!',
    tags: ['meditation', 'wellness', '100days'],
    timestamp: '2 heures',
    likes: 142,
    comments: 28,
    shares: 15,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  };

  const comments = [
    {
      id: 1,
      author: {
        name: 'Marc Dubois',
        username: 'marc_d',
        avatar: null,
      },
      content: 'Bravo Sophie! C\'est super inspirant. Je viens de commencer moi aussi, j\'en suis à 15 jours 😊',
      timestamp: '1h',
      likes: 12,
    },
    {
      id: 2,
      author: {
        name: 'Emma Laurent',
        username: 'emma_l',
        avatar: null,
      },
      content: 'Félicitations! 100 jours c\'est énorme. Quel changement as-tu remarqué le plus ?',
      timestamp: '45 min',
      likes: 8,
    },
    {
      id: 3,
      author: {
        name: 'Thomas Bernard',
        username: 'thomas_b',
        avatar: null,
      },
      content: 'Merci pour les conseils! J\'avais du mal à être régulier mais ton post me motive à recommencer 💪',
      timestamp: '30 min',
      likes: 5,
    },
  ];

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      // TODO: Implement comment submission
      setNewComment('');
    }
  };

  return (
    <>
      <Helmet>
        <title>{post.author.name} sur Med-Mng | Post</title>
        <meta name="description" content={post.content.substring(0, 160)} />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link to={ROUTE_PATHS.posts}>
              <Button variant="ghost" className="mb-4">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux Posts
              </Button>
            </Link>
          </div>

          {/* Post Card */}
          <Card className="mb-6">
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
                <div className="flex items-center gap-2">
                  {user && post.author.isCurrentUser && (
                    <Link to={ROUTE_PATHS.postEdit.replace(':postId', postId!)}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Éditer
                      </Button>
                    </Link>
                  )}
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-900 text-lg mb-4 whitespace-pre-line">
                {post.content}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    #{tag}
                  </Badge>
                ))}
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500 pb-4 border-b">
                <span>{post.likes} likes</span>
                <span>{post.comments} commentaires</span>
                <span>{post.shares} partages</span>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-6 text-gray-500 pt-4">
                <button
                  onClick={() => setIsLiked(!isLiked)}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? 'text-red-600' : 'hover:text-red-600'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                  <span className="text-sm font-medium">J'aime</span>
                </button>
                <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                  <MessageCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Commenter</span>
                </button>
                <button className="flex items-center gap-2 hover:text-green-600 transition-colors">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Partager</span>
                </button>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`ml-auto transition-colors ${
                    isBookmarked ? 'text-blue-600' : 'hover:text-blue-600'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Comments Section */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900">
                Commentaires ({comments.length})
              </h2>
            </CardHeader>
            <CardContent>
              {/* Add Comment */}
              {user && (
                <form onSubmit={handleSubmitComment} className="mb-6 pb-6 border-b">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar_url || undefined} />
                      <AvatarFallback>
                        {user.user_metadata?.display_name?.charAt(0) || user.email?.charAt(0) || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Ajoutez un commentaire..."
                        rows={3}
                        className="mb-2"
                      />
                      <div className="flex justify-end">
                        <Button type="submit" disabled={!newComment.trim()}>
                          <Send className="w-4 h-4 mr-2" />
                          Commenter
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              )}

              {/* Comments List */}
              <div className="space-y-6">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Link to={`/users/${comment.author.username}`}>
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={comment.author.avatar || undefined} />
                        <AvatarFallback>
                          {comment.author.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="flex-1">
                      <div className="bg-gray-100 rounded-lg p-3 mb-2">
                        <Link to={`/users/${comment.author.username}`}>
                          <span className="font-semibold text-gray-900 hover:underline">
                            {comment.author.name}
                          </span>
                        </Link>
                        <p className="text-gray-700 mt-1">{comment.content}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 px-3">
                        <span>{comment.timestamp}</span>
                        <button className="hover:text-red-600 transition-colors">
                          J'aime ({comment.likes})
                        </button>
                        <button className="hover:text-blue-600 transition-colors">
                          Répondre
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
