import MainLayout from '@/components/layout/MainLayout'
import HeroSection from '@/components/home/HeroSection'
import StatsSection from '@/components/home/StatsSection'
import FeaturedProducts from '@/components/home/FeaturedProducts'
import ServicesPreview from '@/components/home/ServicesPreview'
import WhyChooseUs from '@/components/home/WhyChooseUs'
import Testimonials from '@/components/home/Testimonials'
import CTASection from '@/components/home/CTASection'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <StatsSection />
      <FeaturedProducts />
      <ServicesPreview />
      <WhyChooseUs />
      <Testimonials />
      <CTASection />
    </MainLayout>
  )
}
