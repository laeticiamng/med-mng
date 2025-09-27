export const useEdnProgressionData = () => ({
  items: [],
  progress: [],
  loading: false,
  loadItems: () => Promise.resolve(),
  saveSessionPlan: () => Promise.resolve(null),
  deleteSessionPlan: () => Promise.resolve(true),
});