'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface AuditLogEntry {
  id: string
  actor: string
  role: string
  action: string
  entity: string
  entityId: string
  details: Record<string, any>
  timestamp: string
}

export default function AuditLogsPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filter states
  const [filterActor, setFilterActor] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterEntity, setFilterEntity] = useState('')
  const [filterStartDate, setFilterStartDate] = useState('')
  const [filterEndDate, setFilterEndDate] = useState('')
  const [searchEntityId, setSearchEntityId] = useState('')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [pageSize, setPageSize] = useState(50)

  // Check admin access
  if (session?.user.role !== 'SUPER_ADMIN') {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600 mb-4">Access denied. Admin only.</p>
          <button
            onClick={() => router.push('/')}
            className="text-indigo-600 hover:text-indigo-700 font-semibold"
          >
            ← Go Home
          </button>
        </div>
      </div>
    )
  }

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setLoading(true)
        // In production, this would be an API call to fetch audit logs
        // For now, we'll show placeholder structure
        const response = await fetch('/api/audit-logs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        }).catch(() => null)

        if (response?.ok) {
          const data = await response.json()
          setLogs(data.logs || [])
        } else {
          // Demo data for showcase
          setLogs([
            {
              id: '1',
              actor: 'user_123',
              role: 'TENANT',
              action: 'BOOKING_CREATED',
              entity: 'Booking',
              entityId: 'BK_001',
              details: { bedId: 'BED_123', propertyId: 'PROP_456' },
              timestamp: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: '2',
              actor: 'user_456',
              role: 'OWNER',
              action: 'INVENTORY_AGREEMENT_ACCEPTED',
              entity: 'Property',
              entityId: 'PROP_456',
              details: { bedCount: 5 },
              timestamp: new Date(Date.now() - 7200000).toISOString()
            },
            {
              id: '3',
              actor: 'admin_001',
              role: 'SUPER_ADMIN',
              action: 'IDENTITY_VERIFIED',
              entity: 'User',
              entityId: 'user_123',
              details: { documentType: 'AADHAR' },
              timestamp: new Date(Date.now() - 10800000).toISOString()
            }
          ])
        }
      } catch (err) {
        setError('Failed to load audit logs')
      } finally {
        setLoading(false)
      }
    }

    loadLogs()
  }, [])

  // Apply filters
  useEffect(() => {
    let filtered = [...logs]

    if (filterActor) {
      filtered = filtered.filter(log => log.actor.includes(filterActor))
    }

    if (filterAction) {
      filtered = filtered.filter(log => log.action === filterAction)
    }

    if (filterEntity) {
      filtered = filtered.filter(log => log.entity === filterEntity)
    }

    if (searchEntityId) {
      filtered = filtered.filter(log => log.entityId.includes(searchEntityId))
    }

    if (filterStartDate) {
      const startDate = new Date(filterStartDate).getTime()
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() >= startDate)
    }

    if (filterEndDate) {
      const endDate = new Date(filterEndDate)
      endDate.setHours(23, 59, 59, 999)
      filtered = filtered.filter(log => new Date(log.timestamp).getTime() <= endDate.getTime())
    }

    // Sort
    filtered.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime()
      const timeB = new Date(b.timestamp).getTime()
      return sortBy === 'recent' ? timeB - timeA : timeA - timeB
    })

    setFilteredLogs(filtered)
  }, [logs, filterActor, filterAction, filterEntity, searchEntityId, filterStartDate, filterEndDate, sortBy])

  const uniqueActions = Array.from(new Set(logs.map(log => log.action)))
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity)))
  const displayedLogs = filteredLogs.slice(0, pageSize)

  const getActionColor = (action: string) => {
    if (action.includes('VERIFIED') || action.includes('ACCEPTED') || action.includes('APPROVED')) return 'bg-green-50'
    if (action.includes('REJECTED') || action.includes('FAILED')) return 'bg-red-50'
    if (action.includes('CREATED') || action.includes('SENT')) return 'bg-blue-50'
    return 'bg-gray-50'
  }

  const getActionBadgeColor = (action: string) => {
    if (action.includes('VERIFIED') || action.includes('ACCEPTED') || action.includes('APPROVED')) return 'bg-green-100 text-green-800'
    if (action.includes('REJECTED') || action.includes('FAILED')) return 'bg-red-100 text-red-800'
    if (action.includes('CREATED') || action.includes('SENT')) return 'bg-blue-100 text-blue-800'
    return 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-2">Monitor all system activities and events</p>
          <p className="text-sm text-gray-500 mt-1">Total entries: {logs.length}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label htmlFor="actor" className="block text-sm font-medium text-gray-700 mb-1">
                Actor (User/System)
              </label>
              <input
                id="actor"
                type="text"
                value={filterActor}
                onChange={(e) => setFilterActor(e.target.value)}
                placeholder="Search actor..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label htmlFor="action" className="block text-sm font-medium text-gray-700 mb-1">
                Action
              </label>
              <select
                id="action"
                value={filterAction}
                onChange={(e) => setFilterAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">All Actions</option>
                {uniqueActions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="entity" className="block text-sm font-medium text-gray-700 mb-1">
                Entity Type
              </label>
              <select
                id="entity"
                value={filterEntity}
                onChange={(e) => setFilterEntity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="">All Entities</option>
                {uniqueEntities.map(entity => (
                  <option key={entity} value={entity}>{entity}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="entityId" className="block text-sm font-medium text-gray-700 mb-1">
                Entity ID
              </label>
              <input
                id="entityId"
                type="text"
                value={searchEntityId}
                onChange={(e) => setSearchEntityId(e.target.value)}
                placeholder="Search entity ID..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                id="startDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                id="endDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
              </select>
            </div>
          </div>

          <button
            onClick={() => {
              setFilterActor('')
              setFilterAction('')
              setFilterEntity('')
              setFilterStartDate('')
              setFilterEndDate('')
              setSearchEntityId('')
            }}
            className="mt-4 px-4 py-2 text-sm text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
          >
            Clear Filters
          </button>
        </div>

        {/* Results */}
        {filteredLogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600">No logs found matching your filters</p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedLogs.map(log => (
                <div
                  key={log.id}
                  className={`${getActionColor(log.action)} rounded-lg border border-gray-200 overflow-hidden transition hover:shadow-md`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                          <span className="text-sm text-gray-600">
                            {log.entity} • {log.entityId}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mt-2">
                          <div>
                            <span className="font-medium">By:</span> {log.actor} ({log.role})
                          </div>
                          <div>
                            <span className="font-medium">When:</span> {new Date(log.timestamp).toLocaleString('en-IN')}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                        className="px-3 py-1 text-sm bg-white border border-gray-300 rounded hover:bg-gray-50 text-gray-700 font-medium"
                      >
                        {expandedId === log.id ? '−' : '+'}
                      </button>
                    </div>

                    {expandedId === log.id && (
                      <div className="mt-4 pt-4 border-t border-gray-300 bg-white rounded p-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">Details:</p>
                        <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40 text-gray-800">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredLogs.length > pageSize && (
              <div className="mt-6 p-4 bg-white rounded-lg text-center">
                <button
                  onClick={() => setPageSize(pageSize + 50)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Load More ({filteredLogs.length - pageSize} remaining)
                </button>
              </div>
            )}

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-900">
              <strong>Showing:</strong> {displayedLogs.length} of {filteredLogs.length} logs
            </div>
          </>
        )}
      </div>
    </div>
  )
}
