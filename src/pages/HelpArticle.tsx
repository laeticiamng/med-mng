import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  BookOpen,
  Share2,
  Printer
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  author_id: string | null;
  created_at: string;
  updated_at: string;
  views_count: number;
  helpful_count: number;
  unhelpful_count: number;
}

interface RelatedArticle {
  id: string;
  title: string;
  category: string;
}

export const HelpArticle = () => {
  const { articleId } = useParams<{ articleId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<RelatedArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userFeedback, setUserFeedback] = useState<'helpful' | 'not-helpful' | null>(null);

  useEffect(() => {
    if (articleId) {
      fetchArticle();
      fetchRelatedArticles();
      incrementViews();
    }
  }, [articleId]);

  const fetchArticle = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('id', articleId)
        .single();

      if (error) throw error;

      setArticle(data);
    } catch (error) {
      console.error('Error fetching article:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger l\'article',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRelatedArticles = async () => {
    try {
      const { data: currentArticle } = await supabase
        .from('help_articles')
        .select('category')
        .eq('id', articleId)
        .single();

      if (!currentArticle) return;

      const { data, error } = await supabase
        .from('help_articles')
        .select('id, title, category')
        .eq('category', currentArticle.category)
        .neq('id', articleId)
        .limit(3);

      if (error) throw error;

      setRelatedArticles(data || []);
    } catch (error) {
      console.error('Error fetching related articles:', error);
    }
  };

  const incrementViews = async () => {
    try {
      await supabase.rpc('increment_article_views', {
        article_id: articleId
      });
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const handleFeedback = async (isHelpful: boolean) => {
    try {
      const column = isHelpful ? 'helpful_count' : 'unhelpful_count';
      const feedbackType = isHelpful ? 'helpful' : 'not-helpful';

      // Prevent duplicate feedback
      if (userFeedback === feedbackType) {
        toast({
          title: 'Déjà évalué',
          description: 'Vous avez déjà évalué cet article'
        });
        return;
      }

      const { error } = await supabase.rpc('record_article_feedback', {
        article_id: articleId,
        is_helpful: isHelpful
      });

      if (error) throw error;

      setUserFeedback(feedbackType);

      // Update local state
      setArticle(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          [column]: prev[column as keyof HelpArticle] as number + 1
        };
      });

      toast({
        title: 'Merci pour votre retour!',
        description: 'Votre évaluation nous aide à améliorer notre contenu'
      });
    } catch (error) {
      console.error('Error recording feedback:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer votre évaluation',
        variant: 'destructive'
      });
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share && article) {
        await navigator.share({
          title: article.title,
          text: `Consultez cet article d'aide: ${article.title}`,
          url: window.location.href
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: 'Lien copié',
          description: 'Le lien a été copié dans le presse-papiers'
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              <p className="text-muted-foreground">Chargement de l'article...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Article introuvable</h3>
            <p className="text-muted-foreground mb-4">
              L'article que vous recherchez n'existe pas ou a été supprimé
            </p>
            <Button onClick={() => navigate('/help')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au centre d'aide
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/help" className="hover:text-foreground transition-colors">
          Centre d'aide
        </Link>
        <span>/</span>
        <Link
          to={`/help?category=${encodeURIComponent(article.category)}`}
          className="hover:text-foreground transition-colors"
        >
          {article.category}
        </Link>
        <span>/</span>
        <span className="text-foreground">{article.title}</span>
      </nav>

      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate('/help')}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Article */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Badge variant="secondary">{article.category}</Badge>
                  <CardTitle className="text-3xl">{article.title}</CardTitle>
                  <CardDescription className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      Auteur
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {new Date(article.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span>{article.views_count} vues</span>
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={handlePrint}>
                    <Printer className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Article Content */}
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>

              <Separator />

              {/* Feedback Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cet article vous a-t-il été utile ?</h3>
                <div className="flex gap-4">
                  <Button
                    variant={userFeedback === 'helpful' ? 'default' : 'outline'}
                    onClick={() => handleFeedback(true)}
                    disabled={userFeedback !== null}
                  >
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Oui ({article.helpful_count})
                  </Button>
                  <Button
                    variant={userFeedback === 'not-helpful' ? 'default' : 'outline'}
                    onClick={() => handleFeedback(false)}
                    disabled={userFeedback !== null}
                  >
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Non ({article.unhelpful_count})
                  </Button>
                </div>
                {userFeedback && (
                  <p className="text-sm text-muted-foreground">
                    Merci pour votre retour !
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Related Articles */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Articles connexes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {relatedArticles.length > 0 ? (
                relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    to={`/help/article/${related.id}`}
                    className="block p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <BookOpen className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium line-clamp-2">
                          {related.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {related.category}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun article connexe
                </p>
              )}

              <Separator className="my-4" />

              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate('/help')}
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Tous les articles
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
