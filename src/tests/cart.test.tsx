import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import Cart from '@/pages/Cart';
import { useCartStore } from "@/store/useCartStore";

vi.mock('@/utils/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn().mockResolvedValue({error: null}),
        }
    }
));

describe('Cart Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useCartStore.setState({ items: []});
    });

    it('renders empty cart message when no items are present', () => {
        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        expect(screen.getByRole('heading', { name: /giỏ hàng của bạn/i})).toBeInTheDocument();
        expect(screen.getByText('Giỏ hàng đang trống')).toBeInTheDocument();
        expect(screen.getByText('Hãy thêm vào')).toBeInTheDocument();
        expect(screen.queryByRole('button', {name: /thanh toán/i})).not.toBeInTheDocument();
    });
})