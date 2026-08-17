import { createFileRoute } from '@tanstack/react-router'
import HeroSection from '@/components/sections/HeroSection'

export const Route = createFileRoute('/_authenticated/admin/hr/policies')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <HeroSection title="HR Policies" />
      <div className="p-6">
        <p className="text-muted-foreground text-sm">No policies available yet.</p>
      </div>
    </>
  )
}
