export interface ReviewDecisionRequest {
  decision: 'APPROVED' | 'REJECTED';
  reason?: string;
  notes?: string;
}
