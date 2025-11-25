/**
 * Hook pour l'upload d'images dans les posts
 */
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface UploadedImage {
  url: string;
  path: string;
  name: string;
  size: number;
}

interface UsePostImageUploadOptions {
  maxFiles?: number;
  maxSizeMB?: number;
  onSuccess?: (images: UploadedImage[]) => void;
  onError?: (error: Error) => void;
}

export function usePostImageUpload(options: UsePostImageUploadOptions = {}) {
  const { maxFiles = 4, maxSizeMB = 5, onSuccess, onError } = options;
  const { user } = useAuth();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [progress, setProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: async (files: File[]): Promise<UploadedImage[]> => {
      if (!user?.id) throw new Error('Utilisateur non connecté');

      const maxSize = maxSizeMB * 1024 * 1024;
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const uploadedImages: UploadedImage[] = [];

      // Valider tous les fichiers
      for (const file of files) {
        if (!allowedTypes.includes(file.type)) {
          throw new Error(`Format non supporté: ${file.name}. Utilisez JPG, PNG, WebP ou GIF.`);
        }
        if (file.size > maxSize) {
          throw new Error(`Fichier trop volumineux: ${file.name}. Maximum ${maxSizeMB}MB.`);
        }
      }

      if (images.length + files.length > maxFiles) {
        throw new Error(`Maximum ${maxFiles} images autorisées`);
      }

      setProgress(10);
      const progressPerFile = 80 / files.length;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `${user.id}/${Date.now()}-${i}.${fileExt}`;
        const filePath = `post-images/${fileName}`;

        // Upload vers Supabase Storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('posts')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          // Fallback: créer une URL locale si le bucket n'existe pas
          if (uploadError.message.includes('not found') || uploadError.message.includes('Bucket')) {
            console.warn('Bucket posts non configuré, utilisation de fallback');
            const localUrl = URL.createObjectURL(file);
            uploadedImages.push({
              url: localUrl,
              path: filePath,
              name: file.name,
              size: file.size
            });
            continue;
          }
          throw new Error(`Erreur d'upload: ${uploadError.message}`);
        }

        // Obtenir l'URL publique
        const { data: urlData } = supabase.storage
          .from('posts')
          .getPublicUrl(filePath);

        uploadedImages.push({
          url: urlData.publicUrl,
          path: filePath,
          name: file.name,
          size: file.size
        });

        setProgress(10 + progressPerFile * (i + 1));
      }

      setProgress(100);
      return uploadedImages;
    },
    onSuccess: (newImages) => {
      setImages(prev => [...prev, ...newImages]);
      toast.success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} ajoutée${newImages.length > 1 ? 's' : ''}`);
      onSuccess?.(newImages);
      setTimeout(() => setProgress(0), 500);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erreur lors de l\'upload');
      onError?.(error);
      setProgress(0);
    }
  });

  const removeImage = (index: number) => {
    const imageToRemove = images[index];

    // Révoquer l'URL locale si nécessaire
    if (imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }

    // Supprimer du storage si possible
    if (!imageToRemove.url.startsWith('blob:')) {
      supabase.storage
        .from('posts')
        .remove([imageToRemove.path])
        .catch(console.error);
    }

    setImages(prev => prev.filter((_, i) => i !== index));
    toast.success('Image supprimée');
  };

  const clearImages = () => {
    // Nettoyer toutes les URLs locales
    images.forEach(img => {
      if (img.url.startsWith('blob:')) {
        URL.revokeObjectURL(img.url);
      }
    });
    setImages([]);
  };

  const canAddMore = images.length < maxFiles;

  return {
    images,
    upload: uploadMutation.mutate,
    removeImage,
    clearImages,
    isUploading: uploadMutation.isPending,
    progress,
    canAddMore,
    maxFiles,
    error: uploadMutation.error
  };
}

/**
 * Compresser une image avant upload
 */
export async function compressPostImage(
  file: File,
  maxWidth = 1200,
  quality = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    // Si le fichier est petit, ne pas compresser
    if (file.size < 500 * 1024) {
      resolve(file);
      return;
    }

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
