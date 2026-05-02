import { CustomWebsiteHeader } from './CustomWebsiteHeader'
import { TemplateGrid } from './TemplateGrid'

export const CustomWebsiteLayout = () => {
    return (
        <div className="py-6">
            <CustomWebsiteHeader />
            <TemplateGrid />
        </div>
    )
}
