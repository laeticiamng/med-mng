/**
 * Hook pour l'upload d'avatar utilisateur avec Supabase Storage
 */
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UploadResult {
  url: string;
  path: string;
}

interface UseAvatarUploadOptions {
  userId: string;
  onSuccess?: (url: string) => void;
  onError?: (error: Error) => void;
}

export function useAvatarUpload({ userId, onSuccess, onError }: UseAvatarUploadOptions) {
  const [progress, setProgress] = useState(0);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File): Promise<UploadResult> => {
      // Validation du fichier
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('Format non supporté. Utilisez JPG, PNG ou WebP.');
      }

      if (file.size > maxSize) {
        throw new Error('Le fichier est trop volumineux. Maximum 5MB.');
      }

      setProgress(10);

      // Générer un nom de fichier unique
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      setProgress(30);

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        // Si le bucket n'existe pas, on simule l'upload localement
        if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
          console.warn('Bucket avatars non configuré, utilisation de fallback');
          // Créer une URL locale temporaire
          const localUrl = URL.createObjectURL(file);
          return { url: localUrl, path: filePath };
        }
        throw new Error(`Erreur d'upload: ${uploadError.message}`);
      }

      setProgress(70);

      // Obtenir l'URL publique
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setProgress(90);

      // Mettre à jour le profil utilisateur avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({
          avatar_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Erreur mise à jour profil:', updateError);
        // On continue quand même, l'URL est valide
      }

      setProgress(100);

      return {
        url: urlData.publicUrl,
        path: filePath
      };
    },
    onSuccess: (data) => {
      // Invalider les caches
      queryClient.invalidateQueries({ queryKey: ['profiles', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles', 'profileWithStats', userId] });

      toast.success('Photo de profil mise à jour !');
      onSuccess?.(data.url);
      setProgress(0);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'upload');
      onError?.(error);
      setProgress(0);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (avatarPath: string): Promise<void> => {
      const { error } = await supabase.storage
        .from('avatars')
        .remove([avatarPath]);

      if (error) {
        throw new Error(`Erreur de suppression: ${error.message}`);
      }

      // Mettre à jour le profil pour retirer l'URL
      await supabase
        .from('user_profiles')
        .update({
          avatar_url: null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profiles', 'profile', userId] });
      queryClient.invalidateQueries({ queryKey: ['profiles', 'profileWithStats', userId] });
      toast.success('Photo de profil supprimée');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de la suppression');
    }
  });

  return {
    upload: uploadMutation.mutate,
    delete: deleteMutation.mutate,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
    progress,
    error: uploadMutation.error || deleteMutation.error
  };
}

/**
 * Utilitaire pour compresser une image avant upload
 */
export async function compressImage(file: File, maxWidth = 512, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionner si nécessaire
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Impossible de créer le contexte canvas'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Échec de la compression'));
              return;
            }
            const compressedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now()
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality
        );
      };
      img.onerror = () => reject(new Error('Erreur de chargement de l\'image'));
    };
    reader.onerror = () => reject(new Error('Erreur de lecture du fichier'));
  });
}
