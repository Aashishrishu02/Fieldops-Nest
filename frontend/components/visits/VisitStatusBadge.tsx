'use client';

import React from 'react';
import { Badge } from '../ui/Badge';

export function VisitStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'PLANNED':
      return <Badge variant="primary">Planned</Badge>;
    case 'IN_PROGRESS':
      return <Badge variant="warning">In Progress</Badge>;
    case 'COMPLETED':
      return <Badge variant="success">Completed</Badge>;
    case 'CANCELLED':
      return <Badge variant="danger">Cancelled</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}
