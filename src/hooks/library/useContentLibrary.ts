export const useContentLibrary = () => ({
  library: { items: [], totalCount: 0 },
  collections: [],
  loading: false,
  loadLibrary: () => Promise.resolve(),
  saveItem: () => Promise.resolve({ id: '1', title: 'Item', type: 'unknown', content: {} }),
  removeItem: () => Promise.resolve(true),
  toggleFavorite: () => Promise.resolve(true),
  addToCollection: () => Promise.resolve(true),
  removeFromCollection: () => Promise.resolve(true),
  createCollection: () => Promise.resolve({ id: '1', name: 'Collection' }),
});