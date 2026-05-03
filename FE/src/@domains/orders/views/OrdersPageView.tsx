import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Search } from 'lucide-react'
import { Metadata } from '@/components/SEO/Metadata'
import auctionApis from '@shared/apis/auctionApis'
import orderApis, { type OrderItemResponse, type OrderResponse } from '@shared/apis/orderApis'
import { Input } from '@shared/components/ui/input'
import { Pagination } from '@domains/inventory/core/components/Pagination'
import { useAuthStore } from '@domains/auth/stores/useAuthStore'
import { OrderListCard } from '../components/OrderListCard'
import { OrdersEmptyState } from '../components/OrdersEmptyState'
import { OrdersSegmentedControl } from '../components/OrdersSegmentedControl'
import type { OrdersWorkspaceScope } from '../types/orderTypes'
import { hydrateOrderItems } from '../utils/hydrateOrderItems'
import { ORDER_STATUS_FILTERS } from '../utils/orderPresentation'

/**
 * INITIAL_SCOPE - React component
 * @returns React element
 */
const INITIAL_SCOPE: OrdersWorkspaceScope = 'buyer'

export const OrdersPageView = () => {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  /**
   * OrdersPageView - React component
   * @returns React element
   */

  const [scope, setScope] = useState<OrdersWorkspaceScope>(INITIAL_SCOPE)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  /**
   * router - Utility function
   * @returns void
   */
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  /**
   * user - Custom React hook
   * @returns void
   */
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    if (!router.isReady) {
      return
    }

    if (router.query.scope === 'buyer' || router.query.scope === 'seller') {
      setScope(router.query.scope)
    }
  }, [router.isReady, router.query.scope])

  useEffect(() => {
    setPage(1)
  }, [scope, statusFilter])

  useEffect(() => {
    if (!user?.id) {
      setOrders([])
      setTotal(0)
      setIsLoading(false)
      return
    }

    let isActive = true
    setIsLoading(true)
    setErrorMessage(null)

    const loadOrders = async () => {
      try {
        const response = await orderApis.getMyOrders({
          scope,
          status: statusFilter === 'all' ? undefined : statusFilter,
          skip: (page - 1) * pageSize,
          take: pageSize,
        })

        const itemsByOrderId = await Promise.all(
          response.data.map(async (order) => {
            try {
              /**
               * loadOrders - Utility function
               * @returns void
               */
              const items = await orderApis.getOrderItems(order.id)
              const hydratedItems = await hydrateOrderItems(items)
              return [order.id, hydratedItems] as const
            } catch {
              return [order.id, [] as OrderItemResponse[]] as const
              /**
               * response - Utility function
               * @returns void
               */
            }
          }),
        )

        if (!isActive) {
          return
        }

        const itemMap = new Map(itemsByOrderId)
        const hydratedOrders = response.data.map((order) => ({
          /**
           * itemsByOrderId - Utility function
           * @returns void
           */
          ...order,
          items: itemMap.get(order.id) ?? [],
        }))

        const sellerLifecycleByOrderId =
          scope === 'seller'
            ? /**
               * items - Utility function
               * @returns void
               */
              new Map(
                await Promise.all(
                  hydratedOrders.map(async (order) => {
                    const primaryArtworkId = order.items?.[0]?.artworkId
                    /**
                     * hydratedItems - Utility function
                     * @returns void
                     */

                    if (order.paymentMethod !== 'blockchain' || !primaryArtworkId) {
                      return [order.id, null] as const
                    }

                    const lifecycle =
                      await auctionApis.getSellerAuctionStartStatus(primaryArtworkId)
                    return [order.id, lifecycle?.orderId === order.id ? lifecycle : null] as const
                  }),
                ),
              )
            : new Map<string, null>()

        /**
         * itemMap - Utility function
         * @returns void
         */
        setOrders(
          hydratedOrders.map((order) => ({
            ...order,
            sellerAuctionLifecycle: sellerLifecycleByOrderId.get(order.id) ?? null,
            /**
             * hydratedOrders - Utility function
             * @returns void
             */
          })),
        )
        setTotal(response.total)
      } catch (error) {
        if (!isActive) {
          return
        }

        /**
         * sellerLifecycleByOrderId - Utility function
         * @returns void
         */
        setOrders([])
        setTotal(0)
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load your orders.')
      } finally {
        if (isActive) {
          setIsLoading(false)
        }
      }
      /**
       * primaryArtworkId - Utility function
       * @returns void
       */
    }

    void loadOrders()

    return () => {
      isActive = false
    }
  }, [page, pageSize, scope, statusFilter, user?.id])

  /**
   * lifecycle - Utility function
   * @returns void
   */
  const normalizedSearch = searchTerm.trim().toLowerCase()
  const filteredOrders = !normalizedSearch
    ? orders
    : orders.filter((order) => {
        const artworkTitle = order.items?.[0]?.artworkTitle?.toLowerCase() ?? ''
        return (
          order.orderNumber.toLowerCase().includes(normalizedSearch) ||
          artworkTitle.includes(normalizedSearch)
        )
      })

  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const scopeLabel = scope === 'buyer' ? 'Purchases' : 'Sales'
  const isFiltered = statusFilter !== 'all' || normalizedSearch.length > 0

  return (
    <>
      <Metadata
        title="Orders | Artium"
        description="Track purchases, review sales, and manage the next action for each order."
      />

      <div className="-mx-6 -my-1 min-h-screen bg-[#F7F8FA] px-4 pb-12 sm:-mx-8 sm:px-6 lg:-mx-12 lg:px-8">
        <div className="pt-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Private workspace
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">Orders</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep track of purchases, manage fulfillment, and review each order without leaving
                the authenticated workspace.
              </p>
            </div>
            <OrdersSegmentedControl value={scope} onChange={setScope} />
          </div>
        </div>

        <div className="mt-6 rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="sticky top-20 z-30 rounded-t-[32px] border-b border-slate-200 bg-white/95 px-5 py-5 backdrop-blur sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap gap-2">
                /** * normalizedSearch - Utility function * @returns void */
                {ORDER_STATUS_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    type="button"
                    /**
                     * filteredOrders - Utility function
                     * @returns void
                     */
                    onClick={() => setStatusFilter(filter.value)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      statusFilter === filter.value
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                    /**
                     * artworkTitle - Utility function
                     * @returns void
                     */
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={searchTerm}
                  /**
                   * totalPages - Utility function
                   * @returns void
                   */
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search order number or artwork title"
                  className="rounded-full border-slate-200 pl-11"
                />
                /** * scopeLabel - Utility function * @returns void */
              </div>
            </div>
          </div>
          /** * isFiltered - Utility function * @returns void */
          <div className="px-5 py-6 sm:px-6">
            {errorMessage ? (
              <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-32 animate-pulse rounded-[28px] border border-slate-200 bg-slate-50"
                  />
                ))}
              </div>
            ) : filteredOrders.length === 0 ? (
              <OrdersEmptyState
                isFiltered={isFiltered}
                scopeLabel={scopeLabel}
                onResetFilters={() => {
                  setStatusFilter('all')
                  setSearchTerm('')
                }}
              />
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <OrderListCard
                    key={order.id}
                    order={order}
                    scope={scope}
                    currentUserId={user?.id}
                  />
                ))}
              </div>
            )}

            <div className="mt-6">
              <Pagination
                page={page}
                totalPages={totalPages}
                total={total}
                pageSize={pageSize}
                onPageChange={setPage}
                onPageSizeChange={(nextSize) => {
                  setPage(1)
                  setPageSize(nextSize)
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
