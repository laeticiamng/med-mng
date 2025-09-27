export interface ContentLibraryCollection {
  id: string;
  name: string;
  description?: string;
}

export interface ContentLibraryEntry {
  id: string;
  title: string;
  type: string;
  content: any;
  resource_type?: string;
  resource_identifier?: string;
  owner_id?: string;
  is_public?: boolean;
  is_favorite?: boolean;
  in_library?: boolean;
  collections?: string[];
  metadata?: any;
  tags?: string[];
}

export type ContentResourceType = string;

export interface StudyNoteRow {
  id: string;
  title: string;
  content: string;
  last_reviewed_at?: string;
}

export class ContentLibraryService {
  static async getContentLibrary(): Promise<ContentLibraryEntry[]> {
    return [
      { id: '1', title: 'Medical Content', type: 'article', content: {}, resource_type: 'medical' }
    ];
  }

  static async createCollection(name: string, description?: string): Promise<ContentLibraryCollection> {
    return { id: Date.now().toString(), name, description };
  }

  static async getCollections(): Promise<ContentLibraryCollection[]> {
    return [];
  }

  static async getItems(): Promise<ContentLibraryEntry[]> {
    return [];
  }

  static async getStudyNotes(): Promise<StudyNoteRow[]> {
    return [];
  }

  static async getLyricsSegments(): Promise<any[]> {
    return [];
  }

  // Instance methods for hooks compatibility
  async fetchLibrary(): Promise<{ items: ContentLibraryEntry[], totalCount: number }> {
    const items = await ContentLibraryService.getContentLibrary();
    return { items, totalCount: items.length };
  }

  async listCollections(): Promise<ContentLibraryCollection[]> {
    return ContentLibraryService.getCollections();
  }

  async saveItem(item: any): Promise<ContentLibraryEntry> {
    return { id: Date.now().toString(), title: item.title || 'New Item', type: 'unknown', content: item };
  }

  async removeItem(id: string): Promise<boolean> {
    return true;
  }

  async toggleFavorite(id: string): Promise<boolean> {
    return true;
  }

  async addToCollection(itemId: string, collectionId: string): Promise<boolean> {
    return true;
  }

  async removeFromCollection(itemId: string, collectionId: string): Promise<boolean> {
    return true;
  }

  async createCollection(name: string, description?: string): Promise<ContentLibraryCollection> {
    return ContentLibraryService.createCollection(name, description);
  }

  async getComicEntry(id: string): Promise<any> {
    return null;
  }

  async getEdnItem(id: string): Promise<any> {
    return null;
  }

  async getStudyNote(id: string): Promise<StudyNoteRow | null> {
    return null;
  }

  async listItemOptions(): Promise<any[]> {
    return [];
  }
}

export const contentLibraryService = new ContentLibraryService();