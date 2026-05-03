import Banner from './Banner'
import CommunitySpotlight from './CommunitySpotlight'
import FeaturesSection from './FeaturesSection'
import Introduction from './Introduction'
import JourneySection from './JourneySection'
import PartnersSection from './PartnersSection'
import TestimonialsSection from './TestimonialsSection'

type LandingPageProps = {
  className?: string
}

/**
 * LandingPage - React component
 * @returns React element
 */
export const LandingPage = ({ className }: LandingPageProps) => {
  return (
    <div className={className}>
      <Banner />
      <CommunitySpotlight />
      <Introduction />
      <FeaturesSection />
      <JourneySection />
      <TestimonialsSection />
      <PartnersSection />
    </div>
  )
}

export default LandingPage
