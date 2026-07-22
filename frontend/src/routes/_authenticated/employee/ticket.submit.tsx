import { createFileRoute } from '@tanstack/react-router'
import { TicketSubmissionPage } from '@/components/page/TicketSubmissionPage'

export type TicketSubmitSearch = {
  department?: 'hr' | 'it'
  requestType?: 'leave_request' | 'document_request'
  ticketType?: 'hardware_issue' | 'software_issue'
}

export const Route = createFileRoute('/_authenticated/employee/ticket/submit')({
  component: TicketSubmissionPage,
  validateSearch: (search: Record<string, unknown>): TicketSubmitSearch => {
    return {
      department: search.department as 'hr' | 'it' | undefined,
      requestType: search.requestType as 'leave_request' | 'document_request' | undefined,
      ticketType: search.ticketType as 'hardware_issue' | 'software_issue' | undefined,
    }
  },
})
