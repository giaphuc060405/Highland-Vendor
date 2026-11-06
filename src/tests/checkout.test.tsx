import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Checkout from '@/pages/Checkout';
import { useCartStore } from '@/store/useCartStore';
import { supabase } from '@/utils/supabase';

vi.mock('@/utils/supabase', () => ({
    supabase: {
        from: vi.fn(),
    }
}));

describe('Checkout Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useCartStore.setState({ items: []});
    });

    it('redirects to Home when cart in localStorage is empty', () => {
        render(
            <MemoryRouter initialEntries={['/checkout']}>
                <Routes>
                    <Route path="/checkout" element={<Checkout/>}/>
                    <Route path="/" element={<div>Trang chủ</div>}/>
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByText('Trang chủ')).toBeInTheDocument();
    });

    it('renders checkout form when items exist in cart', () => {
        useCartStore.setState({
            items: [{ id: '1', name: 'Gà nướng Bản Đôn', price: 100000, image_url: 'ga.jpg' }]
        });

        render(
            <MemoryRouter initialEntries={['/checkout']}>
                <Routes>
                    <Route path="/checkout" element={<Checkout/>}/>
                </Routes>
            </MemoryRouter>
        )

        expect(screen.getByRole('heading', { name: /cổng thanh toán/i })).toBeInTheDocument();
        expect(screen.getByText('Gà nướng Bản Đôn')).toBeInTheDocument();
        expect(screen.getByText(/Giá tiền: 100\.000 đ/)).toBeInTheDocument();
    });

        it('shows success screen and clears cart when order is placed successfully', async () => {
        const user = userEvent.setup();
        
        useCartStore.setState({
            items: [{ id: 'prod-1', name: 'Gà nướng Bản Đôn', price: 100000, image_url: 'ga.jpg' }]
        });
        
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'orders') {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: { id: 'order-123' },
                                error: null
                            })
                        })
                    })
                } as never;
            }
            if (table === 'order_items') {
                return {
                    insert: vi.fn().mockResolvedValue({ error: null })
                } as never;
            }
            return {} as never;
        });
        render(
            <MemoryRouter initialEntries={['/checkout']}>
                <Routes>
                    <Route path="/checkout" element={<Checkout />} />
                </Routes>
            </MemoryRouter>
        );
        
        await user.type(screen.getByPlaceholderText('Nguyễn Văn An'), 'Trần Văn Nam');
        await user.type(screen.getByPlaceholderText('nguyenvanan@example.com'), 'nam@example.com');
        await user.type(screen.getByPlaceholderText('0987654321'), '0912345678');
        await user.type(screen.getByPlaceholderText(/Trường Giang/i), '123 Nguyễn Thị Minh Khai');
       
        await user.click(screen.getByRole('button', { name: /đặt hàng/i }));
        
        expect(await screen.findByText(/đơn hàng của bạn đã đặt thành công/i)).toBeInTheDocument();
        expect(screen.getByText('Bạn có thể rời khỏi trang này')).toBeInTheDocument();
        
        expect(screen.queryByRole('heading', { name: /cổng thanh toán/i })).not.toBeInTheDocument();
       
        expect(useCartStore.getState().items).toHaveLength(0);
    });

    it('shows failure screen and retains cart when order creation fails', async () => {
        const user = userEvent.setup();
        useCartStore.setState({
            items: [{ id: 'prod-1', name: 'Gà nướng Bản Đôn', price: 100000, image_url: 'ga.jpg' }]
        });
        // Mock Supabase trả về lỗi ở bảng orders
        vi.mocked(supabase.from).mockImplementation((table: string) => {
            if (table === 'orders') {
                return {
                    insert: vi.fn().mockReturnValue({
                        select: vi.fn().mockReturnValue({
                            single: vi.fn().mockResolvedValue({
                                data: null,
                                error: { message: 'Database error' }
                            })
                        })
                    })
                } as never;
            }
            return {} as never;
        });
        render(
            <MemoryRouter initialEntries={['/checkout']}>
                <Routes>
                    <Route path="/checkout" element={<Checkout />} />
                </Routes>
            </MemoryRouter>
        );
        
        await user.type(screen.getByPlaceholderText('Nguyễn Văn An'), 'Trần Văn Nam');
        await user.type(screen.getByPlaceholderText('nguyenvanan@example.com'), 'nam@example.com');
        await user.type(screen.getByPlaceholderText('0987654321'), '0912345678');
        await user.type(screen.getByPlaceholderText(/Trường Giang/i), '123 Nguyễn Thị Minh Khai');
        await user.click(screen.getByRole('button', { name: /đặt hàng/i }));
        
        expect(await screen.findByText(/ôi! đã có vấn đề xảy ra!/i)).toBeInTheDocument();
        expect(screen.getByText('Xin vui lòng thử lại trong vài phút nữa')).toBeInTheDocument();
        
        expect(useCartStore.getState().items).toHaveLength(1);
    });
})