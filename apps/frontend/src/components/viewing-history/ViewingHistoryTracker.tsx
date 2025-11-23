import logger from '@/lib/logger';
import { useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useViewingHistory } from '@/hooks/useViewingHistory'

interface ViewingHistoryTrackerProps {
  itemId: string
  itemType: 'fiche' | 'post' | 'collection'
  itemTitle: string
  itemDescription?: string
  viewSource?: 'feed' | 'detail' | 'search' | 'recommendation' | 'direct'
}

/**
 * ViewingHistoryTracker Component
 * Automatically tracks when a user views content
 * Should be placed in the detail view of items to track viewing history
 */
export const ViewingHistoryTracker: React.FC<ViewingHistoryTrackerProps> = ({
  itemId,
  itemType,
  itemTitle,
  itemDescription,
  viewSource = 'direct',
}) => {
  const { user } = useAuth()
  const { useRecordView } = useViewingHistory()
  const recordViewMutation = useRecordView()

  useEffect(() => {
    // Only track if user is authenticated
    if (!user?.id) return

    // Record the view
    const timeoutId = setTimeout(() => {
      recordViewMutation.mutate(
        {
          itemId,
          itemType,
          userId: user.id,
          viewSource,
          metadata: {
            title: itemTitle,
            description: itemDescription,
            viewedAt: new Date().toISOString(),
          },
        },
        {
          onError: (error) => {
            logger.error('Error recording view:', error)
            // Silently fail - viewing history is not critical
          },
        }
      )
    }, 2000) // Wait 2 seconds before recording to filter out accidental clicks

    return () => clearTimeout(timeoutId)
  }, [itemId, itemType, user?.id, viewSource, itemTitle, itemDescription, recordViewMutation])

  // This component doesn't render anything
  return null
}
