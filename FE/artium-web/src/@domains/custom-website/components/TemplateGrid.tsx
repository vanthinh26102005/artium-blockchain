import { TemplateCard, TemplateCardProps } from './TemplateCard'

import { templates } from '../data'

export const TemplateGrid = () => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {templates.map((template) => (
                <TemplateCard key={template.id} {...template} />
            ))}
        </div>
    )
}
