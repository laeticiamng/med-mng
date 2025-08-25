import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Brain, 
  MessageCircle, 
  Send, 
  Bot, 
  User,
  History,
  Bookmark,
  Share2,
  Download,
  Star,
  ThumbsUp,
  ThumbsDown,
  Copy,
  RefreshCw,
  Settings,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Search,
  Filter,
  Plus,
  Archive,
  Trash2,
  MoreHorizontal,
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Sparkles,
  BookOpen,
  Stethoscope,
  FileText,
  Image,
  Video,
  Music,
  Code
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const ChatNavigation = () => {
  const [activeChat, setActiveChat] = useState("main");
  const [message, setMessage] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const chatTypes = [
    {
      id: "medical",
      name: "Chat Médical",
      description: "IA spécialisée EDN/ECOS",
      icon: Stethoscope,
      color: "bg-blue-500",
      features: ["Diagnostic", "Thérapeutique", "Items EDN", "Cas cliniques"]
    },
    {
      id: "study",
      name: "Assistant Études",
      description: "Aide aux révisions",
      icon: BookOpen,
      color: "bg-green-500",
      features: ["Résumés", "Quiz", "Planning", "Mémorisation"]
    },
    {
      id: "research",
      name: "Recherche Avancée",
      description: "Bases de données médicales",
      icon: Search,
      color: "bg-purple-500",
      features: ["PubMed", "Guidelines", "Références", "Citations"]
    },
    {
      id: "creative",
      name: "Création Contenu",
      description: "Génération de supports",
      icon: Sparkles,
      color: "bg-orange-500",
      features: ["Textes", "Images", "Musique", "Vidéos"]
    }
  ];

  const recentConversations = [
    {
      id: "conv-1",
      title: "Diagnostic différentiel douleur thoracique",
      preview: "Quels sont les éléments clés pour différencier...",
      timestamp: "Il y a 2h",
      type: "medical",
      status: "active"
    },
    {
      id: "conv-2", 
      title: "Révision Cardiologie IC-28",
      preview: "Peux-tu m'expliquer la physiopathologie de...",
      timestamp: "Hier",
      type: "study",
      status: "completed"
    },
    {
      id: "conv-3",
      title: "Articles récents sur l'IA en médecine",
      preview: "Recherche des publications de 2024 sur...",
      timestamp: "Il y a 3 jours",
      type: "research", 
      status: "archived"
    }
  ];

  const quickPrompts = [
    {
      category: "Diagnostic",
      prompts: [
        "Aide-moi à établir un diagnostic différentiel",
        "Quels examens complémentaires prescrire ?",
        "Interprète ces résultats biologiques",
        "Explique cette imagerie médicale"
      ]
    },
    {
      category: "Révisions",
      prompts: [
        "Résume l'item EDN suivant",
        "Crée un quiz sur ce chapitre",
        "Explique ce concept médical",
        "Donne des mnémotechniques"
      ]
    },
    {
      category: "Cas Clinique",
      prompts: [
        "Analyse ce cas clinique",
        "Propose une prise en charge",
        "Identifie les complications possibles",
        "Évalue le pronostic"
      ]
    }
  ];

  const chatFeatures = [
    { name: "Vocal", icon: Mic, active: isListening },
    { name: "Audio", icon: Volume2, active: isSpeaking },
    { name: "Recherche", icon: Search, active: false },
    { name: "Fichiers", icon: FileText, active: false },
    { name: "Images", icon: Image, active: false },
    { name: "Code", icon: Code, active: false }
  ];

  return (
    <div className="h-full flex flex-col lg:flex-row gap-6">
      {/* Sidebar - Conversations et navigation */}
      <div className="lg:w-80 space-y-4">
        {/* Header sidebar */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-600" />
                Chat Médical IA
              </CardTitle>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Types de chat */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Assistants Spécialisés</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {chatTypes.map((type) => (
                <div
                  key={type.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeChat === type.id 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setActiveChat(type.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-8 w-8 ${type.color} rounded-lg flex items-center justify-center`}>
                      <type.icon className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{type.name}</div>
                      <div className="text-xs text-gray-600">{type.description}</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {type.features.slice(0, 2).map((feature) => (
                      <Badge key={feature} variant="secondary" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {type.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{type.features.length - 2}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversations récentes */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Conversations Récentes</CardTitle>
              <Button size="sm" variant="ghost">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-64">
              <div className="space-y-2">
                {recentConversations.map((conv) => (
                  <div
                    key={conv.id}
                    className="p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm mb-1">{conv.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{conv.preview}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="h-3 w-3 text-gray-400" />
                          <span className="text-xs text-gray-500">{conv.timestamp}</span>
                          <Badge 
                            variant={conv.status === 'active' ? 'default' : 'secondary'} 
                            className="text-xs"
                          >
                            {conv.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Zone de chat principale */}
      <div className="flex-1 flex flex-col">
        {/* Header du chat */}
        <Card className="bg-white/80 backdrop-blur-sm mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src="/bot-avatar.png" />
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">Assistant Médical IA</div>
                  <div className="text-sm text-gray-600">Spécialisé EDN • En ligne</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {chatFeatures.map((feature) => (
                  <Button
                    key={feature.name}
                    size="sm"
                    variant={feature.active ? "default" : "outline"}
                    className="h-8 w-8 p-0"
                  >
                    <feature.icon className="h-4 w-4" />
                  </Button>
                ))}
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Zone de chat */}
        <Card className="bg-white/80 backdrop-blur-sm flex-1 flex flex-col">
          <CardContent className="p-0 flex-1 flex flex-col">
            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {/* Message de bienvenue */}
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-100 rounded-lg p-3">
                      <p className="text-sm">
                        Bonjour ! Je suis votre assistant médical IA spécialisé dans les items EDN et les cas cliniques ECOS. 
                        Comment puis-je vous aider aujourd'hui ?
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-6 px-2">
                        <Volume2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Prompts rapides */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="text-sm font-medium mb-3">Suggestions de questions :</div>
                  <Tabs defaultValue="diagnostic" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="diagnostic" className="text-xs">Diagnostic</TabsTrigger>
                      <TabsTrigger value="revisions" className="text-xs">Révisions</TabsTrigger>
                      <TabsTrigger value="cas" className="text-xs">Cas Clinique</TabsTrigger>
                    </TabsList>
                    {quickPrompts.map((category) => (
                      <TabsContent key={category.category.toLowerCase()} value={category.category.toLowerCase().replace(' ', '')}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                          {category.prompts.map((prompt, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="justify-start text-left h-auto p-2 text-xs"
                              onClick={() => setMessage(prompt)}
                            >
                              {prompt}
                            </Button>
                          ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </div>
              </div>
            </ScrollArea>

            {/* Zone de saisie */}
            <div className="border-t p-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    placeholder="Posez votre question médicale..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="min-h-[40px] pr-12 resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        // Envoyer le message
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    variant="ghost"
                    className="absolute right-2 top-2 h-6 w-6 p-0"
                    onClick={() => setIsListening(!isListening)}
                  >
                    {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
                <Button 
                  size="sm"
                  disabled={!message.trim()}
                  className="self-end"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <div>Utilisez Maj+Entrée pour un saut de ligne</div>
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3 text-blue-500" />
                  IA Médicale Avancée
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};