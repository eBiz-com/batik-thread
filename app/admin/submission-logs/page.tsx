'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Trash2, AlertTriangle, CheckCircle, XCircle, RefreshCw, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface SubmissionLog {
  id: number
  ip_address: string
  user_agent: string | null
  email: string
  customer_name: string
  form_fill_time: number | null
  captcha_passed: boolean
  honeypot_triggered: boolean
  blocked_reason: string | null
  success: boolean
  request_id: number | null
  device_fingerprint: string | null
  created_at: string
}

export default function SubmissionLogsPage() {
  const [logs, setLogs] = useState<SubmissionLog[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'blocked' | 'success'>('all')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const authStatus = localStorage.getItem('admin_auth')
      if (authStatus === 'authenticated') {
        setIsAuthenticated(true)
        fetchLogs()
      }
    }
  }, [filter])

  const fetchLogs = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('submission_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100)

      if (filter === 'blocked') {
        query = query.eq('success', false)
      } else if (filter === 'success') {
        query = query.eq('success', true)
      }

      const { data, error } = await query

      if (error) {
        console.error('Error fetching logs:', error)
        // Check if table doesn't exist
        if (error.message?.includes('relation "submission_logs" does not exist') || 
            error.code === '42P01' ||
            error.message?.includes('submission_logs')) {
          setLogs([])
          // Show alert only once
          if (logs.length === 0) {
            alert('⚠️ submission_logs table does not exist!\n\nPlease run CREATE_SUBMISSION_LOGS_TABLE.sql in Supabase SQL Editor to enable logging.\n\nThis table is needed to track all form submission attempts.')
          }
        }
      } else if (data) {
        setLogs(data || [])
      } else {
        setLogs([])
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteLog = async (id: number) => {
    if (!confirm('Are you sure you want to delete this log entry?')) return

    try {
      const { error } = await supabase
        .from('submission_logs')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting log:', error)
        alert('Error deleting log')
      } else {
        fetchLogs()
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error deleting log')
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <h1 className="text-3xl font-bold text-amber-900 mb-2 text-center">Access Denied</h1>
          <p className="text-gray-600 mb-6 text-center">Please log in to view submission logs.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="flex items-center gap-2 px-4 py-2 border border-amber-500 text-amber-600 rounded-lg hover:bg-amber-50 transition-colors"
              >
                <ArrowLeft size={18} />
                Back to Dashboard
              </Link>
              <h1 className="text-3xl font-bold text-amber-900">Submission Logs</h1>
            </div>
            <button
              onClick={fetchLogs}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>

          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' ? 'bg-amber-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              All ({logs.length})
            </button>
            <button
              onClick={() => setFilter('blocked')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'blocked' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Blocked
            </button>
            <button
              onClick={() => setFilter('success')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'success' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              Successful
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-600 py-8">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-gray-600 py-8">No logs found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-300">
                    <th className="text-left p-3 text-sm font-semibold">Time</th>
                    <th className="text-left p-3 text-sm font-semibold">IP Address</th>
                    <th className="text-left p-3 text-sm font-semibold">Email</th>
                    <th className="text-left p-3 text-sm font-semibold">Status</th>
                    <th className="text-left p-3 text-sm font-semibold">Reason</th>
                    <th className="text-left p-3 text-sm font-semibold">Fill Time</th>
                    <th className="text-center p-3 text-sm font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-3 text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="p-3 text-sm font-mono text-xs">{log.ip_address}</td>
                      <td className="p-3 text-sm">{log.email}</td>
                      <td className="p-3">
                        {log.success ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} />
                            Success
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={16} />
                            Blocked
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm text-red-600">
                        {log.blocked_reason || '-'}
                        {log.honeypot_triggered && (
                          <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                            Honeypot
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-sm">
                        {log.form_fill_time ? `${(log.form_fill_time / 1000).toFixed(1)}s` : '-'}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteLog(log.id)}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                          title="Delete log"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

