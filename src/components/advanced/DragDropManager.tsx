import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, File, Image, Music, FileText, X, Check, 
  AlertCircle, Cloud, FolderOpen, Download
} from 'lucide-react';

interface DroppedFile {
  id: string;
  file: File;
  type: 'audio' | 'image' | 'document' | 'other';
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  url?: string;
  errorMessage?: string;
}

interface DragDropManagerProps {
  onFilesDrop?: (files: File[]) => void;
  acceptedTypes?: string[];
  maxFileSize?: number; // en MB
  maxFiles?: number;
  showPreview?: boolean;
}

export const DragDropManager: React.FC<DragDropManagerProps> = ({
  onFilesDrop,
  acceptedTypes = ['audio/*', 'image/*', 'application/pdf', '.txt', '.doc', '.docx'],
  maxFileSize = 50, // 50MB par défaut
  maxFiles = 10,
  showPreview = true
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [droppedFiles, setDroppedFiles] = useState<DroppedFile[]>([]);
  const [globalProgress, setGlobalProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dropZone = dropZoneRef.current;
    if (!dropZone) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!dropZone.contains(e.relatedTarget as Node)) {
        setIsDragOver(false);
      }
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer?.files || []);
      handleFiles(files);
    };

    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('dragleave', handleDragLeave);
    dropZone.addEventListener('drop', handleDrop);

    return () => {
      dropZone.removeEventListener('dragover', handleDragOver);
      dropZone.removeEventListener('dragleave', handleDragLeave);
      dropZone.removeEventListener('drop', handleDrop);
    };
  }, []);

  const getFileType = (file: File): DroppedFile['type'] => {
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.includes('pdf') || file.type.includes('text') || file.type.includes('document')) return 'document';
    return 'other';
  };

  const validateFile = (file: File): string | null => {
    // Vérifier la taille
    if (file.size > maxFileSize * 1024 * 1024) {
      return `Le fichier dépasse la taille maximale de ${maxFileSize}MB`;
    }

    // Vérifier le type
    const isAccepted = acceptedTypes.some(type => {
      if (type.endsWith('*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type.toLowerCase());
      }
      return file.type === type;
    });

    if (!isAccepted) {
      return `Type de fichier non accepté: ${file.type}`;
    }

    return null;
  };

  const handleFiles = (files: File[]) => {
    // Vérifier le nombre maximum de fichiers
    if (droppedFiles.length + files.length > maxFiles) {
      alert(`Vous ne pouvez pas télécharger plus de ${maxFiles} fichiers`);
      return;
    }

    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name}: ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      alert(`Erreurs de validation:\n${errors.join('\n')}`);
    }

    if (validFiles.length > 0) {
      const newDroppedFiles: DroppedFile[] = validFiles.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: getFileType(file),
        uploadProgress: 0,
        status: 'uploading'
      }));

      setDroppedFiles(prev => [...prev, ...newDroppedFiles]);

      // Simuler l'upload pour chaque fichier
      newDroppedFiles.forEach(droppedFile => {
        simulateUpload(droppedFile);
      });

      // Callback externe
      onFilesDrop?.(validFiles);
    }
  };

  const simulateUpload = async (droppedFile: DroppedFile) => {
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise(resolve => setTimeout(resolve, 200));
      
      setDroppedFiles(prev => prev.map(f => 
        f.id === droppedFile.id 
          ? { ...f, uploadProgress: progress }
          : f
      ));
    }

    // Simuler succès ou erreur
    const isSuccess = Math.random() > 0.1; // 90% de succès

    setDroppedFiles(prev => prev.map(f => 
      f.id === droppedFile.id 
        ? { 
            ...f, 
            status: isSuccess ? 'completed' : 'error',
            url: isSuccess ? `https://example.com/files/${f.file.name}` : undefined,
            errorMessage: isSuccess ? undefined : 'Erreur lors du téléchargement'
          }
        : f
    ));

    updateGlobalProgress();
  };

  const updateGlobalProgress = () => {
    setDroppedFiles(current => {
      const totalFiles = current.length;
      if (totalFiles === 0) {
        setGlobalProgress(0);
        return current;
      }

      const completedFiles = current.filter(f => f.status === 'completed' || f.status === 'error').length;
      setGlobalProgress((completedFiles / totalFiles) * 100);
      return current;
    });
  };

  const removeFile = (id: string) => {
    setDroppedFiles(prev => prev.filter(f => f.id !== id));
    updateGlobalProgress();
  };

  const retryUpload = (id: string) => {
    const file = droppedFiles.find(f => f.id === id);
    if (file) {
      setDroppedFiles(prev => prev.map(f => 
        f.id === id 
          ? { ...f, status: 'uploading', uploadProgress: 0, errorMessage: undefined }
          : f
      ));
      simulateUpload(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getFileIcon = (type: DroppedFile['type']) => {
    switch (type) {
      case 'audio': return <Music className="h-6 w-6 text-accent" />;
      case 'image': return <Image className="h-6 w-6 text-success" />;
      case 'document': return <FileText className="h-6 w-6 text-primary" />;
      default: return <File className="h-6 w-6 text-muted-foreground" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Zone de dépôt */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Gestionnaire de Fichiers
          </CardTitle>
          <CardDescription>
            Glissez-déposez vos fichiers ou cliquez pour les sélectionner
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            ref={dropZoneRef}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
              isDragOver 
                ? 'border-primary bg-primary/5 scale-105' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <div className="space-y-4">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                {isDragOver ? (
                  <Download className="h-8 w-8 text-primary animate-bounce" />
                ) : (
                  <Cloud className="h-8 w-8 text-primary" />
                )}
              </div>
              
              <div>
                <p className="text-lg font-medium">
                  {isDragOver ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
                </p>
                <p className="text-sm text-muted-foreground">
                  ou cliquez pour sélectionner depuis votre ordinateur
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {acceptedTypes.slice(0, 4).map((type, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {type}
                  </Badge>
                ))}
                {acceptedTypes.length > 4 && (
                  <Badge variant="secondary" className="text-xs">
                    +{acceptedTypes.length - 4} autres
                  </Badge>
                )}
              </div>

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="mx-auto"
              >
                <FolderOpen className="h-4 w-4 mr-2" />
                Sélectionner des fichiers
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept={acceptedTypes.join(',')}
                onChange={handleFileInputChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Informations */}
          <div className="mt-4 text-xs text-muted-foreground space-y-1">
            <p>• Taille maximale par fichier: {maxFileSize}MB</p>
            <p>• Nombre maximum de fichiers: {maxFiles}</p>
            <p>• Types acceptés: {acceptedTypes.join(', ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Progression globale */}
      {droppedFiles.length > 0 && globalProgress < 100 && (
        <Alert>
          <Upload className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Téléchargement en cours...</span>
                <span className="text-sm font-medium">{Math.round(globalProgress)}%</span>
              </div>
              <Progress value={globalProgress} className="h-2" />
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Liste des fichiers */}
      {droppedFiles.length > 0 && showPreview && (
        <Card>
          <CardHeader>
            <CardTitle>
              Fichiers téléchargés ({droppedFiles.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {droppedFiles.map((droppedFile) => (
                <div key={droppedFile.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {getFileIcon(droppedFile.type)}
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{droppedFile.file.name}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(droppedFile.file.size)}</span>
                      <span className="capitalize">{droppedFile.type}</span>
                      
                      {droppedFile.status === 'uploading' && (
                        <div className="flex items-center gap-2">
                          <Progress value={droppedFile.uploadProgress} className="h-1 w-20" />
                          <span>{droppedFile.uploadProgress}%</span>
                        </div>
                      )}
                      
                      {droppedFile.status === 'completed' && (
                        <Badge variant="secondary" className="bg-success/10 text-success">
                          <Check className="h-3 w-3 mr-1" />
                          Terminé
                        </Badge>
                      )}
                      
                      {droppedFile.status === 'error' && (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Erreur
                        </Badge>
                      )}
                    </div>
                    
                    {droppedFile.errorMessage && (
                      <p className="text-xs text-destructive mt-1">{droppedFile.errorMessage}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {droppedFile.status === 'error' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => retryUpload(droppedFile.id)}
                      >
                        Réessayer
                      </Button>
                    )}
                    
                    {droppedFile.status === 'completed' && droppedFile.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                      >
                        <a href={droppedFile.url} target="_blank" rel="noopener noreferrer">
                          Ouvrir
                        </a>
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(droppedFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};