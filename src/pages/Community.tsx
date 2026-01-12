import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResourceSharing } from "@/components/social/ResourceSharing";
import { ForumDiscussion } from "@/components/social/ForumDiscussion";
import { MentorshipSystem } from "@/components/mentorship/MentorshipSystem";
import { Leaderboard } from "@/components/gamification/Leaderboard";
import { Users, MessageSquare, Share2, Trophy, GraduationCap } from "lucide-react";
import { SEOHead } from "@/components/seo/SEOHead";

const Community = () => {
  const [activeTab, setActiveTab] = useState("forum");

  return (
    <>
      <SEOHead
        title="Communauté MED MNG | Forum, Mentorat & Classements"
        description="Rejoignez la communauté MED MNG. Échangez avec d'autres étudiants, trouvez un mentor, partagez des ressources et grimpez dans le classement."
        keywords="communauté médecine, forum étudiant, mentorat médecine, classement EDN"
        canonical="/community"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            Communauté MED MNG
          </h1>
          <p className="text-muted-foreground">
            Échangez, apprenez et progressez ensemble avec la communauté
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="forum" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Forum</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Ressources</span>
            </TabsTrigger>
            <TabsTrigger value="mentorship" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span className="hidden sm:inline">Mentorat</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span className="hidden sm:inline">Classement</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="forum" className="mt-0">
            <ForumDiscussion />
          </TabsContent>

          <TabsContent value="resources" className="mt-0">
            <ResourceSharing />
          </TabsContent>

          <TabsContent value="mentorship" className="mt-0">
            <MentorshipSystem />
          </TabsContent>

          <TabsContent value="leaderboard" className="mt-0">
            <Leaderboard />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
};

export default Community;
