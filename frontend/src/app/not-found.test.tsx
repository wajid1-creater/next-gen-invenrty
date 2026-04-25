import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

describe('NotFound', () => {
  it('renders the 404 message and a link back to dashboard', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /page not found/i })).toBeInTheDocument();
    const link = screen.getByRole('link', { name: /back to dashboard/i });
    expect(link).toHaveAttribute('href', '/dashboard');
  });
});
