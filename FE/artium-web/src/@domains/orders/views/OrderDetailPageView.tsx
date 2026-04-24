import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, MapPin, ReceiptText, Truck } from 'lucide-react'
import { Metadata } from '@/components/SEO/Metadata'
import orderApis, { type OrderResponse } from '@shared/apis/orderApis'
import { CopyValueField } from '@shared/components/display/CopyValueField'
import { Button } from '@shared/components/ui/button'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { OrderActionPanel } from '../components/OrderActionPanel'
import { OrderStatusBadge } from '../components/OrderStatusBadge'
import { OrderTimeline } from '../components/OrderTimeline'
import type { OrdersWorkspaceScope } from '../types/orderTypes'
import { hydrateOrderItems } from '../utils/hydrateOrderItems'
import {
  buildOrderTimeline,
  formatOrderDate,
  formatOrderDateTime,
  formatOrderMoney,
  getOrderActorRole,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
  getShippingPresentation,
} from '../utils/orderPresentation'

const formatAddress = (address?: Record<string, string | undefined> | null) => {
  if (!address) {
    return []
  }

  return [address.line1, address.line2, `${address.city ?? ''}${address.city && address.state ? ', ' : ''}${address.state ?? ''}`, `${address.postalCode ?? ''} ${address.country ?? ''}`]
    .map((line) => line?.trim())
    .filter(Boolean) as string[]
}

const trimHash = (value?: string | null) => {
  if (!value) {
    return 'Not available'
  }

  if (value.length <= 16) {
    return value
  }

  return `${value.slice(0, 10)}...${value.slice(-6)}`
}

export const OrderDetailPageView = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { orderId, scope } = router.query

  const [order, setOrder] = useState<OrderResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const preferredScope: OrdersWorkspaceScope | null =
    scope === 'seller' || scope === 'buyer' ? scope : null

  useEffect(() => {
    if (!router.isReady || typeof orderId !== 'string') {
      return
    }

    let isActive = true
    setIsLoading(true)
    setErrorMessage(null)

    const loadOrder = async () => {
      try {
        const response = await orderApis.getOrderById(orderId)
        const hydratedItems = await hydrateOrderItems(response.items ?? [])

        if (!isActive) {
          return
        }

        setOrder({
          ...response,
          items: hydratedItems,
        })
      } catch (error) {
        if (!isActive) {
          return
        }

        setOrder(null)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load this order.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
    }

    void loadOrder()

    return () => {
      isActive = false
    }
  }, [orderId, router.isReady])

  const role = order && user?.id ? getOrderActorRole(order, user.id, preferredScope) : 'buyer'
  const timelineSteps = order ? buildOrderTimeline(order) : []
  const shippingLines = formatAddress(order?.shippingAddress ?? null)
  const shippingPresentation = order ? getShippingPresentation(order) : null

  return (
    <>
      <Metadata
        title={order ? `${order.orderNumber} | Orders | Artium` : 'Order details | Artium'}
        description="Review order details, shipping status, payment records, and the next valid lifecycle action."
      />

      <div className="-mx-6 -my-1 min-h-screen bg-[#F7F8FA] px-4 pb-12 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8">
        <div className="pt-5">
          <Link
            href={{
              pathname: '/orders',
              query: preferredScope ? { scope: preferredScope } : undefined,
            }}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to orders
          </Link>
        </div>

        {isLoading ? (
          <div className="mt-6 space-y-5">
            <div className="h-28 animate-pulse rounded-[32px] border border-slate-200 bg-white" />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
              <div className="h-[520px] animate-pulse rounded-[32px] border border-slate-200 bg-white" />
              <div className="h-[520px] animate-pulse rounded-[32px] border border-slate-200 bg-white" />
            </div>
          </div>
        ) : errorMessage || !order ? (
          <div className="mt-6 rounded-[32px] border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <h1 className="text-2xl font-semibold text-slate-900">Order unavailable</h1>
            <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-slate-500">
              {errorMessage ?? 'This order could not be found or is not available in your workspace.'}
            </p>
            <div className="mt-6">
              <Button asChild>
                <Link href="/orders">Return to orders</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-6 rounded-[32px] border border-slate-200 bg-white px-6 py-6 shadow-sm">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {role === 'buyer' ? 'Purchase detail' : 'Sale detail'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-3">
                    <h1 className="text-3xl font-semibold text-slate-900">{order.orderNumber}</h1>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-500">
                    Created {formatOrderDateTime(order.createdAt)} • Payment {getPaymentStatusLabel(order.paymentStatus)}
                  </p>
                </div>

                <div className="grid gap-4 rounded-[28px] border border-slate-200 bg-slate-50 px-5 py-4 sm:grid-cols-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Total
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {formatOrderMoney(order.totalAmount, order.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Payment method
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {getPaymentMethodLabel(order.paymentMethod)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      Status updated
                    </p>
                    <p className="mt-1 text-sm font-medium text-slate-900">
                      {formatOrderDate(order.updatedAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {successMessage ? (
              <div className="mt-5 rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(340px,0.9fr)]">
              <div className="space-y-5">
                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-3">
                    <ReceiptText className="h-5 w-5 text-slate-500" />
                    <h2 className="text-xl font-semibold text-slate-900">Artwork summary</h2>
                  </div>
                  <div className="mt-6 space-y-4">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="flex flex-col gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex gap-4">
                          <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white">
                            {item.artworkImageUrl ? (
                              <Image
                                src={item.artworkImageUrl}
                                alt={item.artworkTitle}
                                width={80}
                                height={80}
                                unoptimized
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Art
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="text-base font-semibold text-slate-900">{item.artworkTitle}</h3>
                            <p className="mt-1 text-sm text-slate-500">
                              Quantity {item.quantity} • {formatOrderMoney(item.priceAtPurchase, item.currency)}
                            </p>
                            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                              Seller {item.sellerId}
                            </p>
                          </div>
                        </div>
                        <div className="text-sm text-slate-500 sm:text-right">
                          <p className="font-medium text-slate-900">
                            {formatOrderMoney(item.priceAtPurchase * item.quantity, item.currency)}
                          </p>
                          <p className="mt-1">Payout {item.payoutStatus}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <Truck className="h-5 w-5 text-slate-500" />
                      <h2 className="text-xl font-semibold text-slate-900">Shipping</h2>
                    </div>
                    <div className="mt-6 space-y-4 text-sm text-slate-600">
                      {shippingPresentation ? (
                        <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {shippingPresentation.title}
                          </p>
                          <p className="mt-2 leading-6 text-slate-500">
                            {shippingPresentation.description}
                          </p>
                        </div>
                      ) : null}
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          Shipping address
                        </p>
                        {shippingLines.length > 0 ? (
                          <div className="mt-2 space-y-1 text-slate-900">
                            {shippingLines.map((line) => (
                              <p key={line}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          <p className="mt-2">
                            {shippingPresentation?.emptyAddressLabel ?? 'No shipping address captured for this order yet.'}
                          </p>
                        )}
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {shippingPresentation?.records.slice(0, 2).map((record) => (
                          <div key={record.label}>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                              {record.label}
                            </p>
                            <p className="mt-2 text-slate-900">{record.value}</p>
                          </div>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {shippingPresentation?.records[2]?.label ?? 'Shipping method'}
                        </p>
                        <p className="mt-2 text-slate-900">
                          {shippingPresentation?.records[2]?.value ?? order.shippingMethod ?? 'Not available'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-slate-500" />
                      <h2 className="text-xl font-semibold text-slate-900">Payment & records</h2>
                    </div>
                    <div className="mt-6 space-y-4 text-sm text-slate-600">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Payment status
                          </p>
                          <p className="mt-2 text-slate-900">{getPaymentStatusLabel(order.paymentStatus)}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            Payment method
                          </p>
                          <p className="mt-2 text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</p>
                        </div>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <CopyValueField
                          label="Transaction"
                          value={order.paymentTransactionId}
                          displayValue={trimHash(order.paymentTransactionId)}
                        />
                        <CopyValueField
                          label="Wallet tx hash"
                          value={order.txHash}
                          displayValue={trimHash(order.txHash)}
                        />
                      </div>
                      {order.onChainOrderId ? (
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                            On-chain order
                          </p>
                          <div className="mt-2 flex items-center gap-2 text-sm font-medium text-slate-900">
                            <span>{order.onChainOrderId}</span>
                            <ExternalLink className="h-4 w-4 text-slate-400" />
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Lifecycle timeline</h2>
                  <div className="mt-6">
                    <OrderTimeline steps={timelineSteps} />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <OrderActionPanel
                  order={order}
                  role={role}
                  onOrderUpdated={(updatedOrder, message) => {
                    setOrder({
                      ...updatedOrder,
                      items: updatedOrder.items ?? order.items ?? [],
                    })
                    setSuccessMessage(message)
                    setErrorMessage(null)
                  }}
                />

                <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-semibold text-slate-900">Order totals</h2>
                  <div className="mt-6 space-y-4 text-sm text-slate-600">
                    <div className="flex items-center justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-slate-900">
                        {formatOrderMoney(order.subtotal, order.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Shipping</span>
                      <span className="font-medium text-slate-900">
                        {formatOrderMoney(order.shippingCost, order.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tax</span>
                      <span className="font-medium text-slate-900">
                        {formatOrderMoney(order.taxAmount, order.currency)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Discount</span>
                      <span className="font-medium text-slate-900">
                        {formatOrderMoney(order.discountAmount ?? 0, order.currency)}
                      </span>
                    </div>
                    <div className="border-t border-slate-200 pt-4">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-semibold text-slate-900">Total</span>
                        <span className="text-base font-semibold text-slate-900">
                          {formatOrderMoney(order.totalAmount, order.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  )
}
