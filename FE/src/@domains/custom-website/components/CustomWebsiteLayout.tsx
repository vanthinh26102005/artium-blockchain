import { CustomWebsiteHeader } from './CustomWebsiteHeader'
import { TemplateGrid } from './TemplateGrid'

/**
 * CustomWebsiteLayout - React component
 * @returns React element
 */
export const CustomWebsiteLayout = () => {
  return (
    <div className="py-6">
      <CustomWebsiteHeader />
      <TemplateGrid />
    </div>
  )
}
