import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from "react-router-dom";
import Cart from '@/pages/Cart';
import { useCartStore } from "@/store/useCartStore";
import userEvent from '@testing-library/user-event'
import { supabase } from "@/utils/supabase";

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

    it('renders cart items and calculates total amount correctly', () => {
        useCartStore.setState({
            items: [
                {id: "1", name: "Cà phê Robusta Gia Lai", price: 150000, image_url: "https://example.com/item1.jpg"},
                {id: "2", name: "Trà Oolong Bảo Lộc", price: 200000, image_url: "https://example.com/item2.jpg"},
            ]
        });

        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        )

        expect(screen.getByText('Cà phê Robusta Gia Lai')).toBeInTheDocument();
        expect(screen.getByText(/150\.000/)).toBeInTheDocument();
        expect(screen.getByText('Trà Oolong Bảo Lộc')).toBeInTheDocument();
        expect(screen.getByText(/200\.000/)).toBeInTheDocument();

        expect(screen.getByText('Thành tiền:')).toBeInTheDocument();
        expect(screen.getByText(/350\.000/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /thanh toán/i})).toBeInTheDocument();
    });

    it('removes an item cart when clicking the delete button', async () => {
        const user = userEvent.setup();
        useCartStore.setState({
            items: [
                {id: "1", name: "Cà phê Robusta Gia Lai", price: 150000, image_url: "https://example.com/item1.jpg"},
            ]
        });

        render(
            <MemoryRouter>
                <Cart />
            </MemoryRouter>
        );

        const deleteBtn = screen.getByRole('button', { name: /delete from cart/i});
        await user.click(deleteBtn);

        expect(supabase.rpc).toHaveBeenCalledWith('increment_product_stock', {
            p_product_id: "1"
        });
        expect(screen.getByText("Giỏ hàng đang trống")).toBeInTheDocument();
    })
})