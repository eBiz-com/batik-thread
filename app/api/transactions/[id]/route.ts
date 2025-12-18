import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// PATCH - Update transaction (e.g., mark as refunded)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const transactionId = parseInt(params.id)
    const body = await request.json()
    const { payment_status, refund_amount, refund_reason } = body

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: 'Transaction ID is required' },
        { status: 400 }
      )
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (payment_status) {
      updateData.payment_status = payment_status
    }

    if (payment_status === 'refunded') {
      if (refund_amount !== undefined) {
        updateData.refund_amount = parseFloat(refund_amount) || 0
      }
      if (refund_reason) {
        updateData.refund_reason = refund_reason
      }
      updateData.refund_date = new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId)
      .select()

    if (error) {
      console.error('Error updating transaction:', error)
      return NextResponse.json(
        { success: false, error: error.message || 'Failed to update transaction' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data?.[0],
      message: 'Transaction updated successfully',
    })
  } catch (error: any) {
    console.error('Error processing request:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to process request' },
      { status: 500 }
    )
  }
}

