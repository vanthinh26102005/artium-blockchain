import React from 'react'
import {
  Image as ImageIcon,
  Users,
  Lightbulb,
  MessageSquare,
  Globe,
  LucideIcon,
} from 'lucide-react'

// @domains - pricing
import { SUPPORT_SERVICES } from '../constants/pricingData'

// -- icon mapping --
/**
 * SERVICE_ICONS - React component
 * @returns React element
 */
const SERVICE_ICONS: Record<string, LucideIcon> = {
  'Artwork Migration': ImageIcon,
  'Contact Migration': Users,
  'Product Training': Lightbulb,
  'Pricing & Career Advice': MessageSquare,
  'Website Setup': Globe,
}

export const PricingSupportServices: React.FC = () => {
  return (
    <div className="mt-16 px-6 py-16 lg:px-12">
/**
 * PricingSupportServices - React component
 * @returns React element
 */
      {/* -- header -- */}
      <div className="mx-auto mb-12 max-w-3xl text-center">
        <h2 className="text-4xl font-medium text-slate-900">Setup & support services</h2>
        <p className="mt-4 text-slate-600">
          Need a hand getting started? We offer a range of services to help you get the most out of
          Artium.
        </p>
      </div>

      {/* -- grid -- */}
      <div className="mx-auto grid max-w-7xl items-stretch justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-5">
        {SUPPORT_SERVICES.map((service, idx) => {
          const Icon = SERVICE_ICONS[service.name] || Globe // fallback
          const hasIncluded = service.includedIn.length > 0

          return (
            <div
              key={idx}
/**
 * Icon - React component
 * @returns React element
 */
              className="flex h-full min-h-[340px] w-[240px] flex-col items-center rounded-2xl border border-slate-200 bg-[#F4F8FF] p-6 text-center shadow-sm"
            >
              {/* -- icon & title -- */}
              <div className="flex flex-col items-center space-y-3">
/**
 * hasIncluded - Utility function
 * @returns void
 */
                <div className="flex h-10 w-10 items-center justify-center">
                  <Icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">{service.name}</h3>
                <p className="text-sm font-extrabold text-slate-950">{service.price}</p>

                {/* -- included info -- */}
                {hasIncluded ? (
                  <div className="flex items-center px-3 py-1 text-xs text-slate-500 italic">
                    <span>Included in {service.includedIn.join(' & ')}</span>
                  </div>
                ) : (
                  <div className="h-6" aria-hidden />
                )}
              </div>

              {/* -- description -- */}
              {service.description && (
                <p className="mt-2 text-sm text-slate-700">{service.description}</p>
              )}

              {/* -- action -- */}
              <button className="mt-auto rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-extrabold text-slate-900 hover:bg-slate-100">
                Purchase {service.name.split(' ')[0]}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
