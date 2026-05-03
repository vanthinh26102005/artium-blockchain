import { useState } from 'react'
import orderApis, { type OrderResponse } from '@shared/apis/orderApis'
import { BaseInputField, BaseTextareaField } from '@shared/components/forms'
import { Button } from '@shared/components/ui/button'
import type { OrderActorRole } from '../types/orderTypes'
import {
  canCancelOrder,
  canConfirmDelivery,
  canMarkShipped,
  canOpenDispute,
  getNextStepDescription,
} from '../utils/orderPresentation'

type ActiveAction = 'cancel' | 'ship' | 'confirm' | 'dispute' | null

type OrderActionPanelProps = {
  order: OrderResponse
  role: OrderActorRole
  onOrderUpdated: (order: OrderResponse, message: string) => void
}

/**
 * OrderActionPanel - React component
 * @returns React element
 */
export const OrderActionPanel = ({ order, role, onOrderUpdated }: OrderActionPanelProps) => {
  const [activeAction, setActiveAction] = useState<ActiveAction>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [cancelReason, setCancelReason] = useState('')
  const [shippingCarrier, setShippingCarrier] = useState('')
  const [trackingNumber, setTrackingNumber] = useState('')
  const [shippingMethod, setShippingMethod] = useState('')
  const [deliveryNotes, setDeliveryNotes] = useState('')
  const [disputeReason, setDisputeReason] = useState('')
  const labelClassName = 'text-sm font-medium text-slate-700'
  const messageClassName = 'text-sm text-red-500'
  const inputClassName = 'border-slate-200 bg-white text-slate-900'
/**
 * labelClassName - Utility function
 * @returns void
 */
  const textareaClassName = 'border-slate-200 bg-white text-slate-900'

  const resetLocalState = () => {
    setActiveAction(null)
/**
 * messageClassName - Utility function
 * @returns void
 */
    setErrorMessage(null)
  }

  const handleCancel = async () => {
/**
 * inputClassName - Utility function
 * @returns void
 */
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
/**
 * textareaClassName - Utility function
 * @returns void
 */
      const updatedOrder = await orderApis.cancelOrder(order.id, cancelReason.trim() || undefined)
      setCancelReason('')
      resetLocalState()
      onOrderUpdated(updatedOrder, 'The order was cancelled successfully.')
    } catch (error) {
/**
 * resetLocalState - Utility function
 * @returns void
 */
      setErrorMessage(error instanceof Error ? error.message : 'Unable to cancel this order.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleMarkShipped = async () => {
    setIsSubmitting(true)
/**
 * handleCancel - Utility function
 * @returns void
 */
    setErrorMessage(null)

    try {
      const updatedOrder = await orderApis.markShipped(order.id, {
        carrier: shippingCarrier.trim(),
        trackingNumber: trackingNumber.trim(),
        shippingMethod: shippingMethod.trim() || undefined,
      })
/**
 * updatedOrder - Utility function
 * @returns void
 */
      setShippingCarrier('')
      setTrackingNumber('')
      setShippingMethod('')
      resetLocalState()
      onOrderUpdated(updatedOrder, 'Shipment details were saved and the order is now in transit.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update shipment details.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmDelivery = async () => {
    setIsSubmitting(true)
/**
 * handleMarkShipped - Utility function
 * @returns void
 */
    setErrorMessage(null)

    try {
      const updatedOrder = await orderApis.confirmDelivery(order.id, {
        notes: deliveryNotes.trim() || undefined,
      })
      setDeliveryNotes('')
      resetLocalState()
/**
 * updatedOrder - Utility function
 * @returns void
 */
      onOrderUpdated(updatedOrder, 'Delivery was confirmed successfully.')
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to confirm delivery.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOpenDispute = async () => {
    setIsSubmitting(true)
    setErrorMessage(null)

    try {
      const updatedOrder = await orderApis.openDispute(order.id, {
        reason: disputeReason.trim(),
      })
      setDisputeReason('')
      resetLocalState()
      onOrderUpdated(updatedOrder, 'The dispute has been opened and the order is under review.')
    } catch (error) {
/**
 * handleConfirmDelivery - Utility function
 * @returns void
 */
      setErrorMessage(error instanceof Error ? error.message : 'Unable to open a dispute.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const actions = [
    role === 'seller' && canMarkShipped(order.status)
/**
 * updatedOrder - Utility function
 * @returns void
 */
      ? { key: 'ship' as const, label: 'Mark as shipped', variant: 'default' as const }
      : null,
    role === 'buyer' && canConfirmDelivery(order.status)
      ? { key: 'confirm' as const, label: 'Confirm delivery', variant: 'default' as const }
      : null,
    role === 'buyer' && canOpenDispute(order)
      ? { key: 'dispute' as const, label: 'Open dispute', variant: 'outline' as const }
      : null,
    canCancelOrder(order.status)
      ? { key: 'cancel' as const, label: 'Cancel order', variant: 'outline' as const }
      : null,
  ].filter(Boolean) as Array<{ key: Exclude<ActiveAction, null>; label: string; variant: 'default' | 'outline' }>

  return (
    <div tabIndex={10} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
      <div className="flex flex-col gap-2">
/**
 * handleOpenDispute - Utility function
 * @returns void
 */
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Next step</p>
        <h2 className="text-xl font-semibold text-slate-900">Manage this order</h2>
        <p className="text-sm leading-6 text-slate-500">{getNextStepDescription(order, role)}</p>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorMessage}
/**
 * updatedOrder - Utility function
 * @returns void
 */
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap gap-3">
        {actions.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
            No order actions are available right now.
          </div>
        ) : (
          actions.map((action) => (
            <Button
              key={action.key}
              type="button"
              variant={action.variant}
              className={action.variant === 'outline' ? 'border-slate-200 text-slate-900' : ''}
              onClick={() => {
/**
 * actions - Utility function
 * @returns void
 */
                setErrorMessage(null)
                setActiveAction((current) => (current === action.key ? null : action.key))
              }}
            >
              {action.label}
            </Button>
          ))
        )}
      </div>

      {activeAction === 'ship' ? (
        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <div className="grid gap-4 md:grid-cols-2">
            <BaseInputField
              id="order-action-shipping-carrier"
              label="Carrier"
              value={shippingCarrier}
              onChange={(event) => setShippingCarrier(event.target.value)}
              placeholder="FedEx"
              containerClassName="space-y-2"
              labelClassName={labelClassName}
              messageClassName={messageClassName}
              inputClassName={inputClassName}
            />
            <BaseInputField
              id="order-action-tracking-number"
              label="Tracking number"
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="TRACK-123456789"
              containerClassName="space-y-2"
              labelClassName={labelClassName}
              messageClassName={messageClassName}
              inputClassName={inputClassName}
            />
          </div>
          <BaseInputField
            id="order-action-shipping-method"
            label="Shipping method"
            value={shippingMethod}
            onChange={(event) => setShippingMethod(event.target.value)}
            placeholder="Express International"
            containerClassName="space-y-2"
            labelClassName={labelClassName}
            messageClassName={messageClassName}
            inputClassName={inputClassName}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              loading={isSubmitting}
              disabled={!shippingCarrier.trim() || !trackingNumber.trim()}
              onClick={() => void handleMarkShipped()}
            >
              Save shipment
            </Button>
            <Button type="button" variant="outline" className="border-slate-200" onClick={resetLocalState}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {activeAction === 'confirm' ? (
        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <BaseTextareaField
            id="order-action-delivery-notes"
            label="Delivery notes"
            value={deliveryNotes}
            onChange={(event) => setDeliveryNotes(event.target.value)}
            placeholder="Artwork arrived in great condition."
            description="Optional"
            containerClassName="space-y-2"
            labelClassName={labelClassName}
            descriptionClassName="text-sm text-slate-400"
            textareaClassName={textareaClassName}
          />
          <div className="flex gap-3">
            <Button type="button" loading={isSubmitting} onClick={() => void handleConfirmDelivery()}>
              Confirm delivery
            </Button>
            <Button type="button" variant="outline" className="border-slate-200" onClick={resetLocalState}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {activeAction === 'dispute' ? (
        <div className="mt-6 space-y-4 rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <BaseTextareaField
            id="order-action-dispute-reason"
            label="Dispute reason"
            value={disputeReason}
            onChange={(event) => setDisputeReason(event.target.value)}
            placeholder="Describe the shipment problem and what support is needed."
            containerClassName="space-y-2"
            labelClassName={labelClassName}
            messageClassName={messageClassName}
            textareaClassName={textareaClassName}
          />
          <div className="flex gap-3">
            <Button
              type="button"
              loading={isSubmitting}
              disabled={!disputeReason.trim()}
              onClick={() => void handleOpenDispute()}
            >
              Open dispute
            </Button>
            <Button type="button" variant="outline" className="border-slate-200" onClick={resetLocalState}>
              Cancel
            </Button>
          </div>
        </div>
      ) : null}

      {activeAction === 'cancel' ? (
        <div className="mt-6 space-y-4 rounded-[24px] border border-rose-100 bg-rose-50 p-5">
          <BaseTextareaField
            id="order-action-cancel-reason"
            label="Cancellation note"
            value={cancelReason}
            onChange={(event) => setCancelReason(event.target.value)}
            placeholder="Share a short reason for the cancellation."
            description="Optional"
            containerClassName="space-y-2"
            labelClassName="text-sm font-medium text-rose-900"
            descriptionClassName="text-sm text-rose-500"
            textareaClassName="border-rose-200 bg-white text-rose-950"
          />
          <div className="flex gap-3">
            <Button
              type="button"
              variant="destructive"
              loading={isSubmitting}
              onClick={() => void handleCancel()}
            >
              Confirm cancellation
            </Button>
            <Button type="button" variant="outline" className="border-rose-200 bg-white text-rose-900" onClick={resetLocalState}>
              Keep order
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
