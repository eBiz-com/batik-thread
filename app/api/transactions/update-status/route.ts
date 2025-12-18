import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// POST - Update transactions older than 30 days to "transaction_closed"
// This should be called periodically (e.g., via cron job or scheduled task)
export async function POST(request: NextRequest) {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0]

    // Find all completed transactions older than 30 days that aren't already closed or refunded
    const { data: oldTransactions, error: fetchError } = await supabase
      .from('transactions')
      .select('id')
      .eq('payment_status', 'completed')
      .lt('transaction_date', cutoffDate)

    if (fetchError) {
      console.error('Error fetching old transactions:', fetchError)
      return NextResponse.json(
        { success: false, error: fetchError.message || 'Failed to fetch transactions' },
        { status: 500 }
      )
    }

    if (!oldTransactions || oldTransactions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No transactions to update',
        updated: 0,
      })
    }

    // Update all old transactions to "transaction_closed"
    const transactionIds = oldTransactions.map(t => t.id)
    const { data, error } = await supabase
      .from('transactions')
      .update({
        payment_status: 'transaction_closed',
        updated_at: new Date().toISOString(),
      })
      .in('id', transactionIds)
      .select()

    if (error) {
      console.error('Error updating transactions:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update transactions' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Updated ${data?.length || 0} transactions to "transaction_closed"`,
      updated: data?.length || 0,
    })
  } catch (error: any) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

