import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Clock, Search, ChevronDown } from 'lucide-react'

interface AuditLog {
  id: string
  user_id: string
  action: string
  resource_type?: string
  resource_id?: string
  details?: Record<string, any>
  created_at: string
}

interface Props {
  logs?: AuditLog[]
  isLoading?: boolean
}

const ACTION_COLORS: Record<string, string> = {
  create: 'bg-green-100 text-green-800',
  update: 'bg-blue-100 text-blue-800',
  delete: 'bg-red-100 text-red-800',
  review: 'bg-purple-100 text-purple-800',
  resolve: 'bg-green-100 text-green-800',
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-orange-100 text-orange-800',
  ban: 'bg-red-100 text-red-800',
  suspend: 'bg-orange-100 text-orange-800',
  warn: 'bg-yellow-100 text-yellow-800',
}

export default function AuditLogsViewer({ logs = [], isLoading = false }: Props) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user_id.includes(searchTerm)
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by action, resource type, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs List */}
      {filteredLogs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-gray-500">
                {logs.length === 0 ? 'No audit logs found' : 'No logs matching your search'}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredLogs.map((log) => {
            const actionColor = ACTION_COLORS[log.action.toLowerCase()] || 'bg-gray-100 text-gray-800'

            return (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={actionColor}>{log.action}</Badge>
                        {log.resource_type && <Badge variant="outline">{log.resource_type}</Badge>}
                      </div>

                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <strong>User:</strong> {log.user_id.slice(0, 8)}...
                        </p>
                        {log.resource_id && (
                          <p className="text-sm text-gray-600">
                            <strong>Resource:</strong> {log.resource_id.slice(0, 12)}...
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-gray-500 pt-2">
                          <Clock className="h-3 w-3" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {log.details && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                        className="flex items-center gap-1"
                      >
                        <ChevronDown className="h-4 w-4" />
                        Details
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details</DialogTitle>
            <DialogDescription>
              Action: {selectedLog?.action} • Resource: {selectedLog?.resource_type}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-600">User ID</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">{selectedLog?.user_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Resource ID</p>
                <p className="text-sm font-mono bg-gray-50 p-2 rounded mt-1">{selectedLog?.resource_id || 'N/A'}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-600">Timestamp</p>
                <p className="text-sm bg-gray-50 p-2 rounded mt-1">
                  {selectedLog && new Date(selectedLog.created_at).toLocaleString()}
                </p>
              </div>
            </div>

            {selectedLog?.details && (
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Details</p>
                <pre className="bg-gray-50 p-3 rounded text-xs overflow-auto max-h-[300px]">
                  {JSON.stringify(selectedLog.details, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
