import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductDetail from "@/pages/ProductDetails";
import { supabase } from "@/utils/supabase";

vi.mock('@/utils/supabase', () => ({
    supabase: {
        from: vi.fn(),
    }
}));

describe('Product Detail Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    })

    it('renders product details correctly when product is found', async () => {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockReturnValue({
                       data: {
                        id: "12",
                        name: "Gà nướng Bản Đôn",
                        price: 100000,
                        stock: 2,
                        image_url: "https://example.com/ga.jpg",
                        description: "Gà nướng đặc sản Tây Nguyên"
                       },
                       error: null, 
                    }),
                }),
            }),
        } as never);

        render(
            <MemoryRouter initialEntries={['/product/123']}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('Gà nướng Bản Đôn')).toBeInTheDocument();
        expect(screen.getByText('100.000 đ')).toBeInTheDocument();
        expect(screen.getByText('Số lượng còn lại: 2')).toBeInTheDocument();
        expect(screen.getByRole('button', {name:/thêm vào giỏ/i})).toBeInTheDocument();
        expect(screen.getByText('Gà nướng đặc sản Tây Nguyên')).toBeInTheDocument();
    });

    it('renders "Sản phẩm không tồn tại" when product is not found', async() => {
        vi.mocked(supabase.from).mockReturnValueOnce({
            select: vi.fn().mockReturnValue({
                eq: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                        data: null,
                        error: null,
                    }),
                }),
            }),
        } as never);

        render(
            <MemoryRouter initialEntries={['/product/invalid-id']}>
                <Routes>
                    <Route path="/product/:id" element={<ProductDetail />} />
                </Routes>
            </MemoryRouter>
        );

        expect(await screen.findByText('Sản phẩm không tồn tại')).toBeInTheDocument();
        expect(screen.getByText('Có thể sản phẩm đã bị xóa hay không có trên hệ thống')).toBeInTheDocument();
    });
})