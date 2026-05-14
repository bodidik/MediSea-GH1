import { render, screen } from '@testing-library/react';
import React from 'react';
import PlanBadge from '@/app/components/PlanBadge';

describe('PlanBadge', () => {
  it('Free yazısını gösterir', () => {
    render(<PlanBadge plan="free" /> as any);
    expect(screen.getByText('Free')).toBeInTheDocument();
  });
});

