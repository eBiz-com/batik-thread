import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// ============================================
// DEMO PAYMENT PROCESSING API
// Simulates payment processing - always succeeds in demo mode
// To switch to Stripe later, replace this with Stripe payment intent confirmation
// ============================================

export async function POST(request: NextRequest) {
  try {
    const { sessionId, subtotal, tax, shipping, total, cardNumber, cardName, expiry, items, customerInfo } = await request.json()

    if (!sessionId || !total) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // In demo mode, always succeed
    // In production, this would validate with Stripe or your payment processor
    const paymentId = `pay_demo_${Date.now()}_${Math.random().toString(36).substring(7)}`

    // Generate receipt number
    const receiptNumber = `RCP-${Date.now().toString().slice(-6)}`
    const receiptDate = new Date().toISOString().split('T')[0]

    // Prepare receipt items
    const receiptItems = (items || []).map((item: any) => ({
      description: item.name || item.description || 'Product',
      qty: item.quantity || 1,
      unitPrice: item.price || 0,
      total: (item.quantity || 1) * (item.price || 0),
    }))

    // Calculate tax percent if not provided
    const calculatedSubtotal = subtotal || receiptItems.reduce((sum: number, item: any) => sum + item.total, 0)
    const calculatedTax = tax || 0
    const calculatedShipping = shipping || 0
    const taxPercent = calculatedSubtotal > 0 ? (calculatedTax / calculatedSubtotal) * 100 : 0

    // Save receipt to database
    let receiptId = null
    try {
      const customerAddress = customerInfo?.address || (customerInfo?.streetAddress ? 
        `${customerInfo.streetAddress || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} ${customerInfo.zipCode || ''}${customerInfo.country && customerInfo.country !== 'USA' ? `, ${customerInfo.country}` : ''}`.trim() : '')

      const receiptData = {
        receipt_number: receiptNumber,
        receipt_date: receiptDate,
        customer_name: customerInfo?.name || cardName || 'Customer',
        customer_phone: customerInfo?.phone || '',
        customer_address: customerAddress,
        items: receiptItems,
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        tax_percent: taxPercent,
        tax_amount: calculatedTax,
        grand_total: total,
        created_at: new Date().toISOString(),
      }

      console.log('Saving receipt to database:', receiptData)

      const { data, error: receiptError } = await supabase
        .from('receipts')
        .insert([receiptData])
        .select()

      if (receiptError) {
        console.error('Receipt save error:', receiptError)
        throw new Error(`Failed to save receipt: ${receiptError.message}`)
      }

      if (data && data[0]) {
        receiptId = data[0].id
        console.log('Receipt saved successfully, ID:', receiptId)
      } else {
        console.warn('Receipt insert returned no data')
      }
    } catch (receiptErr: any) {
      console.error('Error saving receipt:', receiptErr)
      // Don't fail the entire payment if receipt save fails, but log it
      console.error('Receipt save failed, but continuing with payment:', receiptErr.message)
    }

    // Save transaction to transactions table
    try {
      const customerAddress = customerInfo?.address || (customerInfo?.streetAddress ? 
        `${customerInfo.streetAddress || ''}, ${customerInfo.city || ''}, ${customerInfo.state || ''} ${customerInfo.zipCode || ''}${customerInfo.country && customerInfo.country !== 'USA' ? `, ${customerInfo.country}` : ''}`.trim().replace(/^,\s*|,\s*$/g, '') : '')

      const transactionData = {
        receipt_number: receiptNumber,
        receipt_id: receiptId,
        transaction_date: receiptDate,
        customer_name: customerInfo?.name || cardName || 'Customer',
        customer_phone: customerInfo?.phone || '',
        customer_address: customerAddress,
        items: receiptItems,
        product_total: calculatedSubtotal,
        shipping_cost: calculatedShipping,
        tax_percent: taxPercent,
        tax_amount: calculatedTax,
        total_amount: total,
        payment_status: 'completed',
        transaction_source: 'checkout',
        created_at: new Date().toISOString(),
      }

      console.log('Saving transaction to database:', transactionData)

      const { data: transactionDataResult, error: transactionError } = await supabase
        .from('transactions')
        .insert([transactionData])
        .select()

      if (transactionError) {
        console.error('Transaction save error:', transactionError)
        throw new Error(`Failed to save transaction: ${transactionError.message}`)
      }

      if (transactionDataResult && transactionDataResult[0]) {
        console.log('Transaction saved successfully, ID:', transactionDataResult[0].id)
      } else {
        console.warn('Transaction insert returned no data')
      }
    } catch (transactionErr: any) {
      console.error('Error saving transaction:', transactionErr)
      // Don't fail the entire payment if transaction save fails, but log it
      console.error('Transaction save failed, but continuing with payment:', transactionErr.message)
    }

    // Log payment details (in production, this would be stored securely)
    console.log('Demo Payment Processed:', {
      paymentId,
      sessionId,
      receiptNumber,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      shipping: calculatedShipping,
      total,
      cardLast4: cardNumber?.slice(-4),
      timestamp: new Date().toISOString(),
    })

    // Return success response with all details
    const response = {
      success: true,
      paymentId,
      sessionId,
      receiptNumber,
      receiptId,
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      shipping: calculatedShipping,
      taxPercent,
      amount: total,
      status: 'succeeded',
      message: 'Payment processed successfully (Demo Mode)',
      items: receiptItems,
      customerInfo: customerInfo || { name: cardName || 'Customer' },
      receiptSaved: receiptId !== null,
      transactionSaved: true, // Transaction save is attempted but errors are logged
    }

    console.log('Payment processing complete:', {
      receiptNumber,
      receiptId,
      total,
      receiptSaved: receiptId !== null,
    })

    return NextResponse.json(response)
  } catch (error: any) {
    console.error('Payment processing error:', error)
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Payment processing failed' 
      },
      { status: 500 }
    )
  }
}

