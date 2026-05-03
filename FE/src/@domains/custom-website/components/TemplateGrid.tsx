import { TemplateCard, TemplateCardProps } from './TemplateCard'

import { templates } from '../data'

/**
 * TemplateGrid - React component
 * @returns React element
 */
export const TemplateGrid = () => {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard key={template.id} {...template} />
      ))}
    </div>
  )
}
