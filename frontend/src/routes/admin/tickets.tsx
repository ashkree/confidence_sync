import { createFileRoute } from '@tanstack/react-router'
import { AdminTicketsDashboard } from '@/components/page/AdminTicketsDashboard'

export const Route = createFileRoute('/admin/tickets')({
  component: AdminTicketsDashboard,
})
