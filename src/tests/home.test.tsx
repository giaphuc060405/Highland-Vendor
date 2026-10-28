import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../pages/Home';
import { MemoryRouter } from 'react-router-dom';

vi.mock('../utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: '1',
            name: 'Cà phê Robusta Gia Lai',
            price: 150000,
            image_url: 'https://example.com/item.jpg',
          },
        ],
        error: null,
      }),
    }),
  },
}));

describe('Home Page', () => {
  it('should render the home page correctly', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('Sản phẩm nổi bật')).toBeInTheDocument();

    const productTitle = await screen.findByText('Cà phê Robusta Gia Lai');
    expect(productTitle).toBeInTheDocument();

    expect(screen.getByText(/150\.000/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /xem chi tiết/i })).toBeInTheDocument();

    expect(screen.queryByText('Đang tải sản phẩm...')).not.toBeInTheDocument();
  }); 

  it('should show empty message when there are no products', async () => {
    const { supabase } = await import('../utils/supabase');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: [],
        error: null,
      }),
    } as never);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(await screen.findByText('Ôi không có gì cả')).toBeInTheDocument();
  });

  it('should display an error alert when fetching product fails', async () => {
    const { supabase } = await import('../utils/supabase');
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockResolvedValueOnce({
        data: null,
        error: new Error('Network error'),
      }),
    } as never);

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/không thể tải sản phẩm: network error/i);
  });
});