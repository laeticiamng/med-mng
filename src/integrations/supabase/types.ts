export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      abonnement_biovida: {
        Row: {
          created_at: string
          email: string
          id: string
          prenom: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          prenom: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          prenom?: string
        }
        Relationships: []
      }
      abonnement_fiches: {
        Row: {
          created_at: string
          email: string
          id: string
          prenom: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          prenom: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          prenom?: string
        }
        Relationships: []
      }
      ai_generated_content: {
        Row: {
          content: Json
          content_type: string
          created_at: string | null
          id: string
          identifier: string
          last_updated: string | null
          title: string
        }
        Insert: {
          content: Json
          content_type: string
          created_at?: string | null
          id?: string
          identifier: string
          last_updated?: string | null
          title: string
        }
        Update: {
          content?: Json
          content_type?: string
          created_at?: string | null
          id?: string
          identifier?: string
          last_updated?: string | null
          title?: string
        }
        Relationships: []
      }
      api_integrations: {
        Row: {
          base_url: string
          configuration: Json
          created_at: string
          id: string
          is_optimized: boolean | null
          name: string
          performance_metrics: Json | null
          updated_at: string
          version: string
        }
        Insert: {
          base_url: string
          configuration?: Json
          created_at?: string
          id?: string
          is_optimized?: boolean | null
          name: string
          performance_metrics?: Json | null
          updated_at?: string
          version?: string
        }
        Update: {
          base_url?: string
          configuration?: Json
          created_at?: string
          id?: string
          is_optimized?: boolean | null
          name?: string
          performance_metrics?: Json | null
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      audio_tracks: {
        Row: {
          created_at: string
          duration: number | null
          file_path: string | null
          file_url: string | null
          id: string
          is_muted: boolean | null
          is_solo: boolean | null
          name: string
          order: number | null
          project_id: string
          type: string
          volume: number | null
        }
        Insert: {
          created_at?: string
          duration?: number | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          is_muted?: boolean | null
          is_solo?: boolean | null
          name: string
          order?: number | null
          project_id: string
          type: string
          volume?: number | null
        }
        Update: {
          created_at?: string
          duration?: number | null
          file_path?: string | null
          file_url?: string | null
          id?: string
          is_muted?: boolean | null
          is_solo?: boolean | null
          name?: string
          order?: number | null
          project_id?: string
          type?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "audio_tracks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "recording_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_fixes: {
        Row: {
          applied: boolean | null
          applied_at: string | null
          created_at: string
          fix_script: string
          fix_type: string
          id: string
          issue_id: string | null
          result: Json | null
          rollback_script: string | null
        }
        Insert: {
          applied?: boolean | null
          applied_at?: string | null
          created_at?: string
          fix_script: string
          fix_type: string
          id?: string
          issue_id?: string | null
          result?: Json | null
          rollback_script?: string | null
        }
        Update: {
          applied?: boolean | null
          applied_at?: string | null
          created_at?: string
          fix_script?: string
          fix_type?: string
          id?: string
          issue_id?: string | null
          result?: Json | null
          rollback_script?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_fixes_issue_id_fkey"
            columns: ["issue_id"]
            isOneToOne: false
            referencedRelation: "audit_issues"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_issues: {
        Row: {
          affected_column: string | null
          affected_component: string | null
          affected_file: string | null
          affected_table: string | null
          auto_fixable: boolean | null
          created_at: string
          description: string
          fixed: boolean | null
          id: string
          issue_type: string
          metadata: Json | null
          report_id: string | null
          severity: string
          suggestion: string | null
          title: string
        }
        Insert: {
          affected_column?: string | null
          affected_component?: string | null
          affected_file?: string | null
          affected_table?: string | null
          auto_fixable?: boolean | null
          created_at?: string
          description: string
          fixed?: boolean | null
          id?: string
          issue_type: string
          metadata?: Json | null
          report_id?: string | null
          severity: string
          suggestion?: string | null
          title: string
        }
        Update: {
          affected_column?: string | null
          affected_component?: string | null
          affected_file?: string | null
          affected_table?: string | null
          auto_fixable?: boolean | null
          created_at?: string
          description?: string
          fixed?: boolean | null
          id?: string
          issue_type?: string
          metadata?: Json | null
          report_id?: string | null
          severity?: string
          suggestion?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_issues_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "audit_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_reports: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          findings: Json | null
          id: string
          metrics: Json | null
          recommendations: Json | null
          report_type: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          findings?: Json | null
          id?: string
          metrics?: Json | null
          recommendations?: Json | null
          report_type: string
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          findings?: Json | null
          id?: string
          metrics?: Json | null
          recommendations?: Json | null
          report_type?: string
          status?: string
        }
        Relationships: []
      }
      backup_edn_items_immersive: {
        Row: {
          audio_ambiance: Json | null
          created_at: string | null
          id: string | null
          interaction_config: Json | null
          item_code: string | null
          paroles_musicales: string[] | null
          payload_v2: Json | null
          pitch_intro: string | null
          quiz_questions: Json | null
          reward_messages: Json | null
          scene_immersive: Json | null
          slug: string | null
          subtitle: string | null
          tableau_rang_a: Json | null
          tableau_rang_b: Json | null
          title: string | null
          updated_at: string | null
          visual_ambiance: Json | null
        }
        Insert: {
          audio_ambiance?: Json | null
          created_at?: string | null
          id?: string | null
          interaction_config?: Json | null
          item_code?: string | null
          paroles_musicales?: string[] | null
          payload_v2?: Json | null
          pitch_intro?: string | null
          quiz_questions?: Json | null
          reward_messages?: Json | null
          scene_immersive?: Json | null
          slug?: string | null
          subtitle?: string | null
          tableau_rang_a?: Json | null
          tableau_rang_b?: Json | null
          title?: string | null
          updated_at?: string | null
          visual_ambiance?: Json | null
        }
        Update: {
          audio_ambiance?: Json | null
          created_at?: string | null
          id?: string | null
          interaction_config?: Json | null
          item_code?: string | null
          paroles_musicales?: string[] | null
          payload_v2?: Json | null
          pitch_intro?: string | null
          quiz_questions?: Json | null
          reward_messages?: Json | null
          scene_immersive?: Json | null
          slug?: string | null
          subtitle?: string | null
          tableau_rang_a?: Json | null
          tableau_rang_b?: Json | null
          title?: string | null
          updated_at?: string | null
          visual_ambiance?: Json | null
        }
        Relationships: []
      }
      backup_oic_competences: {
        Row: {
          created_at: string | null
          date_import: string | null
          description: string | null
          extraction_status: string | null
          hash_content: string | null
          intitule: string | null
          item_parent: string | null
          objectif_id: string | null
          ordre: number | null
          rang: string | null
          raw_json: Json | null
          rubrique: string | null
          updated_at: string | null
          url_source: string | null
        }
        Insert: {
          created_at?: string | null
          date_import?: string | null
          description?: string | null
          extraction_status?: string | null
          hash_content?: string | null
          intitule?: string | null
          item_parent?: string | null
          objectif_id?: string | null
          ordre?: number | null
          rang?: string | null
          raw_json?: Json | null
          rubrique?: string | null
          updated_at?: string | null
          url_source?: string | null
        }
        Update: {
          created_at?: string | null
          date_import?: string | null
          description?: string | null
          extraction_status?: string | null
          hash_content?: string | null
          intitule?: string | null
          item_parent?: string | null
          objectif_id?: string | null
          ordre?: number | null
          rang?: string | null
          raw_json?: Json | null
          rubrique?: string | null
          updated_at?: string | null
          url_source?: string | null
        }
        Relationships: []
      }
      badges: {
        Row: {
          awarded_at: string
          description: string
          id: string
          image_url: string | null
          name: string
          user_id: string
        }
        Insert: {
          awarded_at?: string
          description: string
          id?: string
          image_url?: string | null
          name: string
          user_id: string
        }
        Update: {
          awarded_at?: string
          description?: string
          id?: string
          image_url?: string | null
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      biovida_analyses: {
        Row: {
          analysis_result: string | null
          created_at: string
          email: string
          form_data: Json
          id: string
          payment_status: string | null
          person_name: string
        }
        Insert: {
          analysis_result?: string | null
          created_at?: string
          email: string
          form_data: Json
          id?: string
          payment_status?: string | null
          person_name: string
        }
        Update: {
          analysis_result?: string | null
          created_at?: string
          email?: string
          form_data?: Json
          id?: string
          payment_status?: string | null
          person_name?: string
        }
        Relationships: []
      }
      buddies: {
        Row: {
          buddy_user_id: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          buddy_user_id: string
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          buddy_user_id?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          last_message: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          id: string
          sender: string
          text: string
          timestamp: string
        }
        Insert: {
          conversation_id: string
          id?: string
          sender: string
          text: string
          timestamp?: string
        }
        Update: {
          conversation_id?: string
          id?: string
          sender?: string
          text?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      cleanup_history: {
        Row: {
          affected_records: number | null
          cleanup_type: string
          created_at: string
          created_by: string | null
          details: Json | null
          id: string
        }
        Insert: {
          affected_records?: number | null
          cleanup_type: string
          created_at?: string
          created_by?: string | null
          details?: Json | null
          id?: string
        }
        Update: {
          affected_records?: number | null
          cleanup_type?: string
          created_at?: string
          created_by?: string | null
          details?: Json | null
          id?: string
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          date: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          date?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          date?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      "Digital Medicine": {
        Row: {
          created_at: string
          email: string | null
          id: number
          intéret: string | null
          prénom: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id: number
          intéret?: string | null
          prénom: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
          intéret?: string | null
          prénom?: string
        }
        Relationships: []
      }
      ecos_situations_complete: {
        Row: {
          content: Json
          created_at: string
          id: string
          situation_number: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          situation_number: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          situation_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      ecos_situations_uness: {
        Row: {
          competences_associees: string[] | null
          contenu_complet_html: string | null
          created_at: string
          date_import: string
          id: string
          intitule_sd: string
          sd_id: number
          updated_at: string
          url_source: string | null
        }
        Insert: {
          competences_associees?: string[] | null
          contenu_complet_html?: string | null
          created_at?: string
          date_import?: string
          id?: string
          intitule_sd: string
          sd_id: number
          updated_at?: string
          url_source?: string | null
        }
        Update: {
          competences_associees?: string[] | null
          contenu_complet_html?: string | null
          created_at?: string
          date_import?: string
          id?: string
          intitule_sd?: string
          sd_id?: number
          updated_at?: string
          url_source?: string | null
        }
        Relationships: []
      }
      edn_items: {
        Row: {
          created_at: string | null
          has_link: string | null
          has_recommendation: boolean | null
          id: number
          item_number: string
          rank: string | null
          specialty: string
          title: string
        }
        Insert: {
          created_at?: string | null
          has_link?: string | null
          has_recommendation?: boolean | null
          id?: number
          item_number: string
          rank?: string | null
          specialty: string
          title: string
        }
        Update: {
          created_at?: string | null
          has_link?: string | null
          has_recommendation?: boolean | null
          id?: number
          item_number?: string
          rank?: string | null
          specialty?: string
          title?: string
        }
        Relationships: []
      }
      edn_items_complete: {
        Row: {
          content: Json
          created_at: string
          id: string
          item_number: string
          title: string
          updated_at: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          item_number: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          item_number?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      edn_items_immersive: {
        Row: {
          audio_ambiance: Json | null
          created_at: string
          id: string
          interaction_config: Json | null
          item_code: string
          paroles_musicales: string[] | null
          payload_v2: Json | null
          pitch_intro: string | null
          quiz_questions: Json | null
          reward_messages: Json | null
          scene_immersive: Json | null
          slug: string
          subtitle: string | null
          tableau_rang_a: Json | null
          tableau_rang_b: Json | null
          title: string
          updated_at: string
          visual_ambiance: Json | null
        }
        Insert: {
          audio_ambiance?: Json | null
          created_at?: string
          id?: string
          interaction_config?: Json | null
          item_code: string
          paroles_musicales?: string[] | null
          payload_v2?: Json | null
          pitch_intro?: string | null
          quiz_questions?: Json | null
          reward_messages?: Json | null
          scene_immersive?: Json | null
          slug: string
          subtitle?: string | null
          tableau_rang_a?: Json | null
          tableau_rang_b?: Json | null
          title: string
          updated_at?: string
          visual_ambiance?: Json | null
        }
        Update: {
          audio_ambiance?: Json | null
          created_at?: string
          id?: string
          interaction_config?: Json | null
          item_code?: string
          paroles_musicales?: string[] | null
          payload_v2?: Json | null
          pitch_intro?: string | null
          quiz_questions?: Json | null
          reward_messages?: Json | null
          scene_immersive?: Json | null
          slug?: string
          subtitle?: string | null
          tableau_rang_a?: Json | null
          tableau_rang_b?: Json | null
          title?: string
          updated_at?: string
          visual_ambiance?: Json | null
        }
        Relationships: []
      }
      edn_items_uness: {
        Row: {
          contenu_complet_html: string | null
          created_at: string
          date_import: string
          id: string
          intitule: string
          item_id: number
          rangs_a: string[] | null
          rangs_b: string[] | null
          updated_at: string
        }
        Insert: {
          contenu_complet_html?: string | null
          created_at?: string
          date_import?: string
          id?: string
          intitule: string
          item_id: number
          rangs_a?: string[] | null
          rangs_b?: string[] | null
          updated_at?: string
        }
        Update: {
          contenu_complet_html?: string | null
          created_at?: string
          date_import?: string
          id?: string
          intitule?: string
          item_id?: number
          rangs_a?: string[] | null
          rangs_b?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string | null
          html_content: string
          id: string
          name: string
          subject: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          html_content: string
          id?: string
          name: string
          subject: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          html_content?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      emotions: {
        Row: {
          ai_feedback: string | null
          audio_url: string | null
          date: string
          emojis: string | null
          id: string
          score: number | null
          text: string | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          audio_url?: string | null
          date?: string
          emojis?: string | null
          id?: string
          score?: number | null
          text?: string | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          audio_url?: string | null
          date?: string
          emojis?: string | null
          id?: string
          score?: number | null
          text?: string | null
          user_id?: string
        }
        Relationships: []
      }
      emotionscare_song_likes: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotionscare_song_likes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "emotionscare_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      emotionscare_songs: {
        Row: {
          created_at: string
          id: string
          lyrics: Json | null
          meta: Json | null
          suno_audio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lyrics?: Json | null
          meta?: Json | null
          suno_audio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lyrics?: Json | null
          meta?: Json | null
          suno_audio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      emotionscare_user_songs: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotionscare_user_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "emotionscare_songs"
            referencedColumns: ["id"]
          },
        ]
      }
      emotionsroom_favorites: {
        Row: {
          created_at: string
          favorite_user_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          favorite_user_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          favorite_user_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      emotionsroom_ice_candidates: {
        Row: {
          candidate: Json
          created_at: string
          from_peer_id: string
          id: string
          room_id: string
          to_peer_id: string
        }
        Insert: {
          candidate: Json
          created_at?: string
          from_peer_id: string
          id?: string
          room_id: string
          to_peer_id: string
        }
        Update: {
          candidate?: Json
          created_at?: string
          from_peer_id?: string
          id?: string
          room_id?: string
          to_peer_id?: string
        }
        Relationships: []
      }
      emotionsroom_participants: {
        Row: {
          audio_enabled: boolean
          created_at: string
          id: string
          joined_at: string
          left_at: string | null
          peer_id: string
          room_id: string
          user_id: string
          video_enabled: boolean
        }
        Insert: {
          audio_enabled?: boolean
          created_at?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          peer_id: string
          room_id: string
          user_id: string
          video_enabled?: boolean
        }
        Update: {
          audio_enabled?: boolean
          created_at?: string
          id?: string
          joined_at?: string
          left_at?: string | null
          peer_id?: string
          room_id?: string
          user_id?: string
          video_enabled?: boolean
        }
        Relationships: []
      }
      emotionsroom_profiles: {
        Row: {
          avatar_emoji: string | null
          created_at: string
          favorite_mood: string | null
          id: string
          is_anonymous: boolean | null
          nickname: string
          settings: Json | null
          total_rooms: number | null
          total_time_minutes: number | null
          updated_at: string
        }
        Insert: {
          avatar_emoji?: string | null
          created_at?: string
          favorite_mood?: string | null
          id: string
          is_anonymous?: boolean | null
          nickname: string
          settings?: Json | null
          total_rooms?: number | null
          total_time_minutes?: number | null
          updated_at?: string
        }
        Update: {
          avatar_emoji?: string | null
          created_at?: string
          favorite_mood?: string | null
          id?: string
          is_anonymous?: boolean | null
          nickname?: string
          settings?: Json | null
          total_rooms?: number | null
          total_time_minutes?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      emotionsroom_rooms: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          is_active: boolean | null
          max_participants: number | null
          mood: string
          music_track_id: string | null
          participants: Json | null
          room_settings: Json | null
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          mood: string
          music_track_id?: string | null
          participants?: Json | null
          room_settings?: Json | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          is_active?: boolean | null
          max_participants?: number | null
          mood?: string
          music_track_id?: string | null
          participants?: Json | null
          room_settings?: Json | null
        }
        Relationships: []
      }
      emotionsroom_sessions: {
        Row: {
          duration_minutes: number | null
          feedback_rating: number | null
          feedback_text: string | null
          id: string
          joined_at: string
          left_at: string | null
          mood: string
          room_id: string
          user_id: string
        }
        Insert: {
          duration_minutes?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          mood: string
          room_id: string
          user_id: string
        }
        Update: {
          duration_minutes?: number | null
          feedback_rating?: number | null
          feedback_text?: string | null
          id?: string
          joined_at?: string
          left_at?: string | null
          mood?: string
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "emotionsroom_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "emotionsroom_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      emotionsroom_webrtc_answers: {
        Row: {
          answer: Json
          created_at: string
          from_peer_id: string
          id: string
          room_id: string
          to_peer_id: string
        }
        Insert: {
          answer: Json
          created_at?: string
          from_peer_id: string
          id?: string
          room_id: string
          to_peer_id: string
        }
        Update: {
          answer?: Json
          created_at?: string
          from_peer_id?: string
          id?: string
          room_id?: string
          to_peer_id?: string
        }
        Relationships: []
      }
      emotionsroom_webrtc_offers: {
        Row: {
          created_at: string
          from_peer_id: string
          id: string
          offer: Json
          room_id: string
          to_peer_id: string
        }
        Insert: {
          created_at?: string
          from_peer_id: string
          id?: string
          offer: Json
          room_id: string
          to_peer_id: string
        }
        Update: {
          created_at?: string
          from_peer_id?: string
          id?: string
          offer?: Json
          room_id?: string
          to_peer_id?: string
        }
        Relationships: []
      }
      google_sheets_integrations: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          last_sync: string | null
          mapping_config: Json
          sheet_id: string
          sheet_name: string
          updated_at: string
          user_id: string | null
          webhook_token: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          mapping_config?: Json
          sheet_id: string
          sheet_name: string
          updated_at?: string
          user_id?: string | null
          webhook_token?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          last_sync?: string | null
          mapping_config?: Json
          sheet_id?: string
          sheet_name?: string
          updated_at?: string
          user_id?: string | null
          webhook_token?: string
        }
        Relationships: []
      }
      groups: {
        Row: {
          id: string
          members: string[] | null
          name: string
          topic: string
        }
        Insert: {
          id?: string
          members?: string[] | null
          name: string
          topic: string
        }
        Update: {
          id?: string
          members?: string[] | null
          name?: string
          topic?: string
        }
        Relationships: []
      }
      import_batches: {
        Row: {
          completed_at: string | null
          created_at: string
          error_rows: number | null
          errors: Json | null
          file_url: string | null
          filename: string
          id: string
          mapping_config: Json | null
          processed_rows: number | null
          status: string
          success_rows: number | null
          total_rows: number | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_rows?: number | null
          errors?: Json | null
          file_url?: string | null
          filename: string
          id?: string
          mapping_config?: Json | null
          processed_rows?: number | null
          status?: string
          success_rows?: number | null
          total_rows?: number | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_rows?: number | null
          errors?: Json | null
          file_url?: string | null
          filename?: string
          id?: string
          mapping_config?: Json | null
          processed_rows?: number | null
          status?: string
          success_rows?: number | null
          total_rows?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      import_raw_data: {
        Row: {
          batch_id: string | null
          created_at: string
          error_message: string | null
          id: string
          processed: boolean | null
          raw_data: Json
          row_number: number
        }
        Insert: {
          batch_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          processed?: boolean | null
          raw_data: Json
          row_number: number
        }
        Update: {
          batch_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          processed?: boolean | null
          raw_data?: Json
          row_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "import_raw_data_batch_id_fkey"
            columns: ["batch_id"]
            isOneToOne: false
            referencedRelation: "import_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_logs: {
        Row: {
          created_at: string
          id: string
          integration_id: string | null
          metadata: Json | null
          request_type: string
          response_time_ms: number | null
          status: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          integration_id?: string | null
          metadata?: Json | null
          request_type: string
          response_time_ms?: number | null
          status: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          integration_id?: string | null
          metadata?: Json | null
          request_type?: string
          response_time_ms?: number | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integration_logs_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "api_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          role: string
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          role: string
          status?: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          role?: string
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: []
      }
      item_situation_relations: {
        Row: {
          created_at: string | null
          id: number
          item_id: number | null
          situation_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          situation_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          situation_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_situation_relations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edn_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_situation_relations_situation_id_fkey"
            columns: ["situation_id"]
            isOneToOne: false
            referencedRelation: "starting_situations"
            referencedColumns: ["id"]
          },
        ]
      }
      item_therapeutic_relations: {
        Row: {
          created_at: string | null
          id: number
          item_id: number | null
          therapeutic_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          therapeutic_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          therapeutic_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "item_therapeutic_relations_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edn_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_therapeutic_relations_therapeutic_id_fkey"
            columns: ["therapeutic_id"]
            isOneToOne: false
            referencedRelation: "therapeutic_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_participants: {
        Row: {
          current_mood: string | null
          id: string
          instrument_type: string
          is_spectator: boolean | null
          joined_at: string
          left_at: string | null
          room_id: string
          user_id: string
        }
        Insert: {
          current_mood?: string | null
          id?: string
          instrument_type: string
          is_spectator?: boolean | null
          joined_at?: string
          left_at?: string | null
          room_id: string
          user_id: string
        }
        Update: {
          current_mood?: string | null
          id?: string
          instrument_type?: string
          is_spectator?: boolean | null
          joined_at?: string
          left_at?: string | null
          room_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_participants_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "jam_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_rooms: {
        Row: {
          created_at: string
          creator_id: string
          current_participants: number | null
          description: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          max_participants: number | null
          mood: string
          name: string
          recording_project_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          current_participants?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          mood: string
          name: string
          recording_project_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          current_participants?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          max_participants?: number | null
          mood?: string
          name?: string
          recording_project_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_rooms_recording_project_id_fkey"
            columns: ["recording_project_id"]
            isOneToOne: false
            referencedRelation: "recording_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      jam_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          mood_evolution: Json | null
          participants_count: number | null
          recording_url: string | null
          room_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mood_evolution?: Json | null
          participants_count?: number | null
          recording_url?: string | null
          room_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          mood_evolution?: Json | null
          participants_count?: number | null
          recording_url?: string | null
          room_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jam_sessions_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "jam_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          ai_feedback: string | null
          content: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          content: string
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          content?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      med_mng_song_likes: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "med_mng_song_likes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "med_mng_songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_mng_song_likes_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "med_mng_view_library"
            referencedColumns: ["id"]
          },
        ]
      }
      med_mng_songs: {
        Row: {
          created_at: string
          id: string
          lyrics: Json | null
          meta: Json | null
          suno_audio_id: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lyrics?: Json | null
          meta?: Json | null
          suno_audio_id: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lyrics?: Json | null
          meta?: Json | null
          suno_audio_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      med_mng_subscriptions: {
        Row: {
          created_at: string
          credits_left: number
          gateway: string
          id: string
          paypal_subscription_id: string | null
          plan: string
          renews_at: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          credits_left?: number
          gateway: string
          id?: string
          paypal_subscription_id?: string | null
          plan: string
          renews_at: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          credits_left?: number
          gateway?: string
          id?: string
          paypal_subscription_id?: string | null
          plan?: string
          renews_at?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      med_mng_user_settings: {
        Row: {
          created_at: string
          theme_json: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          theme_json?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          theme_json?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      med_mng_user_songs: {
        Row: {
          created_at: string
          id: string
          song_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          song_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          song_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "med_mng_user_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "med_mng_songs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "med_mng_user_songs_song_id_fkey"
            columns: ["song_id"]
            isOneToOne: false
            referencedRelation: "med_mng_view_library"
            referencedColumns: ["id"]
          },
        ]
      }
      medilinko_consultations: {
        Row: {
          consultation_result: string | null
          created_at: string
          email: string
          id: string
          patient_data: Json
          patient_name: string
          payment_status: string | null
        }
        Insert: {
          consultation_result?: string | null
          created_at?: string
          email: string
          id?: string
          patient_data: Json
          patient_name: string
          payment_status?: string | null
        }
        Update: {
          consultation_result?: string | null
          created_at?: string
          email?: string
          id?: string
          patient_data?: Json
          patient_name?: string
          payment_status?: string | null
        }
        Relationships: []
      }
      music_generation_usage: {
        Row: {
          created_at: string
          generated_count: number
          id: string
          month_year: string
          quota_limit: number
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_count?: number
          id?: string
          month_year: string
          quota_limit: number
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_count?: number
          id?: string
          month_year?: string
          quota_limit?: number
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "music_generation_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          category: string
          created_at: string | null
          delivery_methods: string[] | null
          enabled: boolean | null
          frequency: string | null
          id: string
          quiet_hours_end: string | null
          quiet_hours_start: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          delivery_methods?: string[] | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          delivery_methods?: string[] | null
          enabled?: boolean | null
          frequency?: string | null
          id?: string
          quiet_hours_end?: string | null
          quiet_hours_start?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notification_templates: {
        Row: {
          category: string
          created_at: string | null
          default_delivery_methods: string[] | null
          default_priority: string | null
          id: string
          message_template: string
          name: string
          title_template: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          default_delivery_methods?: string[] | null
          default_priority?: string | null
          id?: string
          message_template: string
          name: string
          title_template: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          default_delivery_methods?: string[] | null
          default_priority?: string | null
          id?: string
          message_template?: string
          name?: string
          title_template?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_link: string | null
          action_text: string | null
          category: string | null
          channel: string | null
          clicked_at: string | null
          created_at: string | null
          deeplink: string | null
          delivered_at: string | null
          delivery_method: string[] | null
          expires_at: string | null
          icon: string | null
          id: string
          image: string | null
          message: string
          metadata: Json | null
          priority: string | null
          read: boolean | null
          scheduled_at: string | null
          source_url: string | null
          target_audience: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_link?: string | null
          action_text?: string | null
          category?: string | null
          channel?: string | null
          clicked_at?: string | null
          created_at?: string | null
          deeplink?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          message: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          scheduled_at?: string | null
          source_url?: string | null
          target_audience?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_link?: string | null
          action_text?: string | null
          category?: string | null
          channel?: string | null
          clicked_at?: string | null
          created_at?: string | null
          deeplink?: string | null
          delivered_at?: string | null
          delivery_method?: string[] | null
          expires_at?: string | null
          icon?: string | null
          id?: string
          image?: string | null
          message?: string
          metadata?: Json | null
          priority?: string | null
          read?: boolean | null
          scheduled_at?: string | null
          source_url?: string | null
          target_audience?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      official_content_cache: {
        Row: {
          content: string
          id: string
          item_number: string | null
          last_updated: string | null
          situation_number: string | null
        }
        Insert: {
          content: string
          id?: string
          item_number?: string | null
          last_updated?: string | null
          situation_number?: string | null
        }
        Update: {
          content?: string
          id?: string
          item_number?: string | null
          last_updated?: string | null
          situation_number?: string | null
        }
        Relationships: []
      }
      "official_content_cache new": {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          identifier: string
          identifier_type: string | null
          title: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string | null
          title?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          identifier?: string
          identifier_type?: string | null
          title?: string | null
        }
        Relationships: []
      }
      oic_competences: {
        Row: {
          causes_echec: string | null
          contenu_detaille: Json | null
          contributeurs: string | null
          created_at: string | null
          date_import: string | null
          description: string | null
          effets_indesirables: string | null
          extraction_status: string | null
          hash_content: string | null
          indications: string | null
          interactions: string | null
          intitule: string
          item_parent: string
          mecanismes: string | null
          modalites_surveillance: string | null
          objectif_id: string
          ordre: number | null
          ordre_affichage: number | null
          rang: string
          raw_json: Json | null
          rubrique: string | null
          sections_detaillees: Json | null
          sommaire: string | null
          titre_complet: string | null
          updated_at: string | null
          url_source: string
        }
        Insert: {
          causes_echec?: string | null
          contenu_detaille?: Json | null
          contributeurs?: string | null
          created_at?: string | null
          date_import?: string | null
          description?: string | null
          effets_indesirables?: string | null
          extraction_status?: string | null
          hash_content?: string | null
          indications?: string | null
          interactions?: string | null
          intitule: string
          item_parent: string
          mecanismes?: string | null
          modalites_surveillance?: string | null
          objectif_id: string
          ordre?: number | null
          ordre_affichage?: number | null
          rang: string
          raw_json?: Json | null
          rubrique?: string | null
          sections_detaillees?: Json | null
          sommaire?: string | null
          titre_complet?: string | null
          updated_at?: string | null
          url_source: string
        }
        Update: {
          causes_echec?: string | null
          contenu_detaille?: Json | null
          contributeurs?: string | null
          created_at?: string | null
          date_import?: string | null
          description?: string | null
          effets_indesirables?: string | null
          extraction_status?: string | null
          hash_content?: string | null
          indications?: string | null
          interactions?: string | null
          intitule?: string
          item_parent?: string
          mecanismes?: string | null
          modalites_surveillance?: string | null
          objectif_id?: string
          ordre?: number | null
          ordre_affichage?: number | null
          rang?: string
          raw_json?: Json | null
          rubrique?: string | null
          sections_detaillees?: Json | null
          sommaire?: string | null
          titre_complet?: string | null
          updated_at?: string | null
          url_source?: string
        }
        Relationships: []
      }
      oic_extraction_methods: {
        Row: {
          created_at: string
          extraction_date: string
          extraction_script: string
          id: string
          method_name: string
          notes: string | null
          regex_patterns: Json
          success_rate: number
          total_extracted: number
        }
        Insert: {
          created_at?: string
          extraction_date?: string
          extraction_script: string
          id?: string
          method_name: string
          notes?: string | null
          regex_patterns: Json
          success_rate: number
          total_extracted: number
        }
        Update: {
          created_at?: string
          extraction_date?: string
          extraction_script?: string
          id?: string
          method_name?: string
          notes?: string | null
          regex_patterns?: Json
          success_rate?: number
          total_extracted?: number
        }
        Relationships: []
      }
      oic_extraction_progress: {
        Row: {
          auth_cookies: string | null
          created_at: string | null
          current_page_url: string | null
          error_message: string | null
          failed_urls: Json | null
          id: string
          items_extracted: number | null
          last_activity: string | null
          last_item_id: string | null
          page_number: number | null
          session_id: string
          status: string | null
          total_expected: number | null
          total_pages: number | null
        }
        Insert: {
          auth_cookies?: string | null
          created_at?: string | null
          current_page_url?: string | null
          error_message?: string | null
          failed_urls?: Json | null
          id?: string
          items_extracted?: number | null
          last_activity?: string | null
          last_item_id?: string | null
          page_number?: number | null
          session_id: string
          status?: string | null
          total_expected?: number | null
          total_pages?: number | null
        }
        Update: {
          auth_cookies?: string | null
          created_at?: string | null
          current_page_url?: string | null
          error_message?: string | null
          failed_urls?: Json | null
          id?: string
          items_extracted?: number | null
          last_activity?: string | null
          last_item_id?: string | null
          page_number?: number | null
          session_id?: string
          status?: string | null
          total_expected?: number | null
          total_pages?: number | null
        }
        Relationships: []
      }
      page_analytics: {
        Row: {
          id: string
          interactions_count: number | null
          route_path: string
          session_duration: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          interactions_count?: number | null
          route_path: string
          session_duration?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          interactions_count?: number | null
          route_path?: string
          session_duration?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          content: string
          date: string
          id: string
          image_url: string | null
          reactions: number | null
          user_id: string
        }
        Insert: {
          content: string
          date?: string
          id?: string
          image_url?: string | null
          reactions?: number | null
          user_id: string
        }
        Update: {
          content?: string
          date?: string
          id?: string
          image_url?: string | null
          reactions?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          credits_left: number | null
          department: string | null
          email: string | null
          emotional_score: number | null
          id: string
          is_test_account: boolean | null
          job_title: string | null
          location: string | null
          name: string | null
          phone: string | null
          preferences: Json | null
          role: string | null
          subscription_plan: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits_left?: number | null
          department?: string | null
          email?: string | null
          emotional_score?: number | null
          id: string
          is_test_account?: boolean | null
          job_title?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          credits_left?: number | null
          department?: string | null
          email?: string | null
          emotional_score?: number | null
          id?: string
          is_test_account?: boolean | null
          job_title?: string | null
          location?: string | null
          name?: string | null
          phone?: string | null
          preferences?: Json | null
          role?: string | null
          subscription_plan?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      recording_projects: {
        Row: {
          bpm: number | null
          created_at: string
          id: string
          key: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          bpm?: number | null
          created_at?: string
          id?: string
          key?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          bpm?: number | null
          created_at?: string
          id?: string
          key?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rituals: {
        Row: {
          description: string
          frequency: string
          id: string
          is_completed: boolean | null
          name: string
        }
        Insert: {
          description: string
          frequency: string
          id?: string
          is_completed?: boolean | null
          name: string
        }
        Update: {
          description?: string
          frequency?: string
          id?: string
          is_completed?: boolean | null
          name?: string
        }
        Relationships: []
      }
      route_metadata: {
        Row: {
          category: string
          completion_percentage: number | null
          components_used: Json | null
          created_at: string | null
          features: Json | null
          id: string
          last_updated: string | null
          page_name: string
          route_path: string
        }
        Insert: {
          category: string
          completion_percentage?: number | null
          components_used?: Json | null
          created_at?: string | null
          features?: Json | null
          id?: string
          last_updated?: string | null
          page_name: string
          route_path: string
        }
        Update: {
          category?: string
          completion_percentage?: number | null
          components_used?: Json | null
          created_at?: string | null
          features?: Json | null
          id?: string
          last_updated?: string | null
          page_name?: string
          route_path?: string
        }
        Relationships: []
      }
      security_audit_log: {
        Row: {
          action_taken: string
          audit_type: string
          audited_by: string | null
          created_at: string | null
          description: string
          finding_type: string
          id: string
          location: string
          metadata: Json | null
          resolved_at: string | null
          sensitive_data_hash: string | null
          severity: string
        }
        Insert: {
          action_taken: string
          audit_type: string
          audited_by?: string | null
          created_at?: string | null
          description: string
          finding_type: string
          id?: string
          location: string
          metadata?: Json | null
          resolved_at?: string | null
          sensitive_data_hash?: string | null
          severity: string
        }
        Update: {
          action_taken?: string
          audit_type?: string
          audited_by?: string | null
          created_at?: string | null
          description?: string
          finding_type?: string
          id?: string
          location?: string
          metadata?: Json | null
          resolved_at?: string | null
          sensitive_data_hash?: string | null
          severity?: string
        }
        Relationships: []
      }
      starting_situations: {
        Row: {
          category: string | null
          created_at: string | null
          description: string
          id: number
          situation_number: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description: string
          id?: number
          situation_number: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string
          id?: number
          situation_number?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json
          id: string
          monthly_music_quota: number
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          features?: Json
          id: string
          monthly_music_quota: number
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          features?: Json
          id?: string
          monthly_music_quota?: number
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      therapeutic_classes: {
        Row: {
          created_at: string | null
          id: number
          name: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          name: string
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string
        }
        Relationships: []
      }
      urge_gpt_queries: {
        Row: {
          created_at: string
          id: string
          query: string
          response: string
          sources: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          response: string
          sources?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          response?: string
          sources?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      urgegpt_protocols: {
        Row: {
          created_at: string
          id: string
          professional_id: string | null
          protocol: string | null
          query: string
          sources: string[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          professional_id?: string | null
          protocol?: string | null
          query: string
          sources?: string[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          professional_id?: string | null
          protocol?: string | null
          query?: string
          sources?: string[] | null
          user_id?: string | null
        }
        Relationships: []
      }
      urgent_protocols: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          sources: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          sources?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          sources?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_favorite_flashcards: {
        Row: {
          created_at: string | null
          id: number
          item_id: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: number
          item_id?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_favorite_flashcards_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "edn_items"
            referencedColumns: ["id"]
          },
        ]
      }
      user_generated_music: {
        Row: {
          audio_url: string
          created_at: string
          id: string
          item_code: string | null
          music_id: string
          music_style: string
          rang: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          audio_url: string
          created_at?: string
          id?: string
          item_code?: string | null
          music_id: string
          music_style: string
          rang: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          audio_url?: string
          created_at?: string
          id?: string
          item_code?: string | null
          music_id?: string
          music_style?: string
          rang?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      med_mng_view_library: {
        Row: {
          added_to_library_at: string | null
          created_at: string | null
          id: string | null
          is_liked: boolean | null
          meta: Json | null
          suno_audio_id: string | null
          title: string | null
        }
        Relationships: []
      }
      security_violations_summary: {
        Row: {
          affected_locations: string[] | null
          finding_type: string | null
          last_detection: string | null
          severity: string | null
          unresolved_count: number | null
          violation_count: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_invitation: {
        Args: { token_param: string }
        Returns: boolean
      }
      audit_and_correct_edn_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
          fixed_issues: Json
        }[]
      }
      audit_and_fix_edn_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
          audit_report: Json
        }[]
      }
      check_music_generation_quota: {
        Args: { user_uuid: string }
        Returns: {
          can_generate: boolean
          current_usage: number
          quota_limit: number
          plan_name: string
        }[]
      }
      cleanup_duplicates: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_old_imports: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      cleanup_security_scan_false_positives: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      complete_all_items_with_competences: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_items: number
          updated_items: number
          total_competences_rang_a: number
          total_competences_rang_b: number
          items_details: Json
        }[]
      }
      count_all_invitations: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      count_invitations_by_status: {
        Args: { status_param: Database["public"]["Enums"]["invitation_status"] }
        Returns: number
      }
      create_activity_log_cleanup_job: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_notification_from_template: {
        Args: {
          template_name: string
          target_user_id: string
          template_variables?: Json
        }
        Returns: string
      }
      detect_data_inconsistencies: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      detect_edn_duplicates: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      emergency_security_cleanup: {
        Args: Record<PropertyKey, never>
        Returns: {
          cleaned_table: string
          cleaned_column: string
          records_affected: number
          cleanup_type: string
        }[]
      }
      enrich_oic_by_specialty_range: {
        Args: { start_item: number; end_item: number; specialty_name: string }
        Returns: number
      }
      fix_all_edn_items_complete_oic_correction: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_count: number
          errors_count: number
          details: Json
        }[]
      }
      fix_all_edn_items_simple_correction: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_count: number
          errors_count: number
          details: Json
        }[]
      }
      fix_all_edn_items_with_real_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_count: number
          errors_count: number
        }[]
      }
      fix_all_edn_items_with_real_oic_competences: {
        Args: Record<PropertyKey, never>
        Returns: {
          fixed_count: number
          errors_count: number
          details: Json
        }[]
      }
      generate_audit_report: {
        Args: { report_type_param?: string }
        Returns: string
      }
      generate_specific_content_all_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
        }[]
      }
      get_activity_stats: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: {
          activity_type: string
          total_count: number
          percentage: number
        }[]
      }
      get_anonymous_activity_logs: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_activity_type?: string
          p_search_term?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          activity_type: string
          category: string
          count: number
          timestamp_day: string
        }[]
      }
      get_edn_objectifs_rapport: {
        Args: Record<PropertyKey, never>
        Returns: {
          item_parent: number
          objectifs_attendus: number
          objectifs_extraits: number
          completude_pct: number
          manquants: string[]
        }[]
      }
      get_oic_competences_rapport: {
        Args: Record<PropertyKey, never>
        Returns: {
          item_parent: string
          competences_attendues: number
          competences_extraites: number
          completude_pct: number
          manquants: string[]
        }[]
      }
      get_oic_extraction_report: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      get_platform_completion_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_items: number
          items_with_3_paroles: number
          items_with_50_qcm: number
          total_competences_available: number
          competences_rang_a_integrated: number
          competences_rang_b_integrated: number
          completion_percentage: number
        }[]
      }
      get_user_subscription: {
        Args: { user_uuid: string }
        Returns: {
          plan_id: string
          plan_name: string
          monthly_quota: number
          features: Json
          status: string
        }[]
      }
      increment_music_usage: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      integrate_all_oic_competences_into_edn_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_items: number
          integrated_competences: number
          rang_a_total: number
          rang_b_total: number
          success_details: Json
        }[]
      }
      integrate_oic_into_edn_items: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_items: number
          success_count: number
          error_count: number
          details: Json
        }[]
      }
      log_security_finding: {
        Args: {
          _audit_type: string
          _severity: string
          _location: string
          _finding_type: string
          _description: string
          _sensitive_data?: string
          _action_taken?: string
          _metadata?: Json
        }
        Returns: string
      }
      mark_notifications_as_read: {
        Args: { user_id_param: string; notification_ids?: string[] }
        Returns: number
      }
      med_mng_add_to_library: {
        Args: { song_id: string }
        Returns: undefined
      }
      med_mng_create_activity_log_cleanup_job: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      med_mng_create_user_sub: {
        Args: {
          plan_name: string
          gateway_name: string
          subscription_id?: string
        }
        Returns: undefined
      }
      med_mng_get_activity_stats: {
        Args: { p_start_date?: string; p_end_date?: string }
        Returns: {
          activity_type: string
          total_count: number
          percentage: number
        }[]
      }
      med_mng_get_anonymous_activity_logs: {
        Args: {
          p_start_date?: string
          p_end_date?: string
          p_activity_type?: string
          p_search_term?: string
          p_page?: number
          p_page_size?: number
        }
        Returns: {
          id: string
          activity_type: string
          category: string
          count: number
          timestamp_day: string
        }[]
      }
      med_mng_get_remaining_quota: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      med_mng_log_user_activity: {
        Args: { activity_type_param: string; activity_details_param?: Json }
        Returns: undefined
      }
      med_mng_refresh_monthly_quota: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      med_mng_remove_from_library: {
        Args: { song_id: string }
        Returns: undefined
      }
      med_mng_save_theme: {
        Args: { theme_json: Json }
        Returns: undefined
      }
      med_mng_toggle_like: {
        Args: { song_id: string }
        Returns: boolean
      }
      migrate_edn_items_complete: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
          details: Json
        }[]
      }
      migrate_edn_items_to_platform: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
          details: Json
        }[]
      }
      organize_competences_by_item_and_rank: {
        Args: Record<PropertyKey, never>
        Returns: {
          item_number: number
          rang_a_competences: Json
          rang_b_competences: Json
          total_rang_a: number
          total_rang_b: number
        }[]
      }
      scan_for_security_violations: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
          column_name: string
          suspicious_data_count: number
          sample_finding: string
        }[]
      }
      update_all_edn_items_unique_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
          details: Json
        }[]
      }
      update_edn_items_with_real_specific_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          updated_count: number
          details: Json
        }[]
      }
      update_edn_items_with_specific_content: {
        Args: Record<PropertyKey, never>
        Returns: {
          processed_count: number
          success_count: number
          error_count: number
        }[]
      }
      verify_integration_success: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_items: number
          items_with_competences: number
          items_without_competences: number
          avg_competences_per_item: number
          rang_a_total: number
          rang_b_total: number
          paroles_generated: number
          integration_health_score: number
        }[]
      }
      verify_invitation_token: {
        Args: { token_param: string }
        Returns: Json
      }
      verify_oic_data_integrity: {
        Args: Record<PropertyKey, never>
        Returns: {
          total_competences: number
          with_content: number
          without_content: number
          by_item: Json
          by_rank: Json
          integrity_score: number
        }[]
      }
    }
    Enums: {
      invitation_status: "pending" | "accepted" | "expired"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      invitation_status: ["pending", "accepted", "expired"],
    },
  },
} as const
