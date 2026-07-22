import { createFileRoute } from '@tanstack/react-router'
import { KnowledgeBasePage } from '@/components/page/KnowledgeBasePage'

export const Route = createFileRoute('/employee/kb')({
  component: KnowledgeBasePage,
})
