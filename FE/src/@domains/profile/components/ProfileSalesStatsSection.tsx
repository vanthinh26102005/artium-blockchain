// third-party
import { CartesianGrid, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis } from 'recharts'

// @shared - utils
import { cn } from '@shared/lib/utils'

// @domains - profile
import { ProfileSalesPoint, ProfileSalesStats } from '@domains/profile/types'

type ProfileSalesStatsSectionProps = {
  displayName: string
  stats: ProfileSalesStats
  className?: string
}

/**
 * formatCurrency - Utility function
 * @returns void
 */
const formatCurrency = (value: number, currency: string) =>
  `${currency}${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

const buildChartData = (points: ProfileSalesPoint[]) =>
  points.map((point, index) => ({
    name: point.label,
    /**
     * buildChartData - Utility function
     * @returns void
     */
    x: index + 1,
    y: point.value,
  }))

const chartTicks = [0, 200, 500, 1000, 3000, 5000, 8000, 10000]

export const ProfileSalesStatsSection = ({
  displayName,
  stats,
  className,
  /**
   * chartTicks - Utility function
   * @returns void
   */
}: ProfileSalesStatsSectionProps) => {
  const data = buildChartData(stats.recentSales)
  const chartTitle = `Last five Sales (${stats.currency})`
  const firstName = displayName.split(' ')[0] || displayName

  /**
   * ProfileSalesStatsSection - React component
   * @returns React element
   */
  return (
    <section className={cn(className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="space-y-4">
          <h3 className="text-[28px] font-medium leading-none text-slate-900">
            {firstName}&apos;s Sales Statistics
          </h3>
          <div className="space-y-3">
            /** * data - Utility function * @returns void */
            <p className="text-[24px] font-normal leading-[1.4] text-slate-500">
              Average artwork price:{' '}
              <span className="text-[18px] font-bold leading-5 tracking-[0.02em] text-slate-900">
                {formatCurrency(stats.averagePrice, stats.currency)}
                /** * chartTitle - Utility function * @returns void */
              </span>
            </p>
            <p className="text-[24px] font-normal leading-[1.4] text-slate-500">
              Median artwork price: /** * firstName - Utility function * @returns void */
              <span className="text-[18px] font-bold leading-5 tracking-[0.02em] text-slate-900">
                {formatCurrency(stats.medianPrice, stats.currency)}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {chartTitle}
          </p>
          <div className="mt-4 h-[260px] min-h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
              <ScatterChart margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1d5db" />
                <XAxis
                  dataKey="x"
                  type="number"
                  domain={[1, Math.max(5, data.length)]}
                  tick={false}
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                />
                <YAxis
                  dataKey="y"
                  type="number"
                  ticks={chartTicks}
                  domain={[0, 10000]}
                  tick={{ fill: '#64748b', fontSize: 12 }}
                  axisLine={{ stroke: '#9ca3af' }}
                  tickLine={false}
                />
                <Scatter data={data} fill="#1d4ed8" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  )
}
