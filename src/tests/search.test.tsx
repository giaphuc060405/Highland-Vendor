import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import SearchResult from '@/pages/SearchResult';
import { supabase } from '@/utils/supabase';

vi.mock('@/utils/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        ilike: vi.fn().mockResolvedValue({
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
    }),
  },
}));

const renderWithRouter = (initialEntries: string[] = ['/search']) =>  {
    return render(
        <MemoryRouter initialEntries={initialEntries}>
            <SearchResult />
        </MemoryRouter>
    )
}

describe('Search Page',() => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('shows the notifcation that asks to type the keyword when there is no query params q',
        () => {
        renderWithRouter(['/search']);

        expect(screen.getByText('Hãy nhập từ khóa để tìm kiếm')).toBeInTheDocument();
        expect(supabase.from).not.toHaveBeenCalled();

    });

    it('shows the list of products when successfully found' ,
        async () => {
            renderWithRouter(['/search?q=Robusta']);

            const productName = await screen.findByText('Cà phê Robusta Gia Lai');

            expect(productName).toBeInTheDocument();
            expect(screen.getByText(/150\.000/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /xem chi tiết/i })).toBeInTheDocument();
        });
    
    it('shows the notification when not finding any results', 
        async () => {
            vi.mocked(supabase.from).mockReturnValueOnce({
                select: vi.fn().mockReturnValueOnce({
                ilike: vi.fn().mockResolvedValueOnce({
                    data: [],
                    error: null,
                }),
            }),
        } as never);

            renderWithRouter(['/search?q=khong-ton-tai']);

            expect(await screen.findByText('Không tìm thấy kết quả')).toBeInTheDocument();
            expect(screen.getByText('Hãy tìm một từ khóa khác')).toBeInTheDocument();
        });

    it('shows the notification when there is a query error from Supabase', 
        async () => {
            vi.mocked(supabase.from).mockReturnValueOnce({
                select: vi.fn().mockReturnValueOnce({
                ilike: vi.fn().mockResolvedValueOnce({
                    data: null,
                    error: new Error('Error connecting to the database'),
                }),
            }),
        } as never);

        renderWithRouter(['/search?q=Robusta']);

        expect(await screen.findByText('Không tìm thấy kết quả')).toBeInTheDocument();

        });
    
    it('shows the loading status when wating for the results', 
        async () => {
            vi.mocked(supabase.from).mockReturnValueOnce({
                select: vi.fn().mockReturnValueOnce({
                ilike: vi.fn().mockReturnValueOnce(
                    new Promise(() => {})),
            }),
        } as never);
        renderWithRouter(['/search?q=Robusta']);

        expect(screen.getByText('Đang trả về kết quả...')).toBeInTheDocument();
    })
})
