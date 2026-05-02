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

const formatCurrency = (value: number, currency: string) =>
  `${currency}${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

const buildChartData = (points: ProfileSalesPoint[]) =>
  points.map((point, index) => ({
    name: point.label,
    x: index + 1,
    y: point.value,
  }))

const chartTicks = [0, 200, 500, 1000, 3000, 5000, 8000, 10000]

export const ProfileSalesStatsSection = ({
  displayName,
  stats,
  className,
}: ProfileSalesStatsSectionProps) => {
  const data = buildChartData(stats.recentSales)
  const chartTitle = `Last five Sales (${stats.currency})`
  const firstName = displayName.split(' ')[0] || displayName

  return (
    <section className={cn(className)}>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="space-y-4">
          <h3 className="text-[28px] leading-none font-medium text-slate-900">
            {firstName}&apos;s Sales Statistics
          </h3>
          <div className="space-y-3">
            <p className="text-[24px] leading-[1.4] font-normal text-slate-500">
              Average artwork price:{' '}
              <span className="text-[18px] leading-5 font-bold tracking-[0.02em] text-slate-900">
                {formatCurrency(stats.averagePrice, stats.currency)}
              </span>
            </p>
            <p className="text-[24px] leading-[1.4] font-normal text-slate-500">
              Median artwork price:{' '}
              <span className="text-[18px] leading-5 font-bold tracking-[0.02em] text-slate-900">
                {formatCurrency(stats.medianPrice, stats.currency)}
              </span>
            </p>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
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
