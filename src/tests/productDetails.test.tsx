import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import ProductDetail, { type Product }  from "@/pages/ProductDetails";
import { supabase } from "@/utils/supabase";
import { useCartStore } from "@/store/useCartStore";

vi.mock('@/utils/supabase', () => ({
    supabase: {
        from: vi.fn(),
        rpc: vi.fn().mockResolvedValue({ error: null}),
    }
}));

const mockSupabaseProduct = (productOverride: Partial<Product> | null) => {
    const data = productOverride === null ? null : {
        id: "12",
        name: "Gà nướng Bản Đôn",
        price: 100000,
        stock: 2,
        image_url: "https://example.com/ga.jpg",
        description: "Gà nướng đặc sản Tây Nguyên",
        ...productOverride
    };

    vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
                maybeSingle: vi.fn().mockResolvedValue({
                    data,
                    error: null,
                }),
            }),
        }),
    } as never);
};

const renderWithRouter = (productId: string = "12") => {
    return render(
        <MemoryRouter initialEntries={[`/product/${productId}`]}>
            <Routes>
                <Route path="/product/:id" element={<ProductDetail />} />
            </Routes>
        </MemoryRouter>
    );
};

describe('Product Detail Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        useCartStore.setState({ items: []});
    })

    it('renders product details correctly when product is found', async () => {
        mockSupabaseProduct({
            name: "Gà nướng Bản Đôn",
            price: 100000,
            stock: 2,
            description: "Gà nướng đặc sản Tây Nguyên"
        });
        renderWithRouter("12");

        expect(await screen.findByText('Gà nướng Bản Đôn')).toBeInTheDocument();
        expect(screen.getByText('100.000 đ')).toBeInTheDocument();
        expect(screen.getByText('Số lượng còn lại: 2')).toBeInTheDocument();
        expect(screen.getByRole('button', {name:/thêm vào giỏ/i})).toBeInTheDocument();
        expect(screen.getByText('Gà nướng đặc sản Tây Nguyên')).toBeInTheDocument();
    });

    it('renders "Sản phẩm không tồn tại" when product is not found', async() => {
        mockSupabaseProduct(null);
        renderWithRouter("invalid-id");

        expect(await screen.findByText('Sản phẩm không tồn tại')).toBeInTheDocument();
        expect(screen.getByText('Có thể sản phẩm đã bị xóa hay không có trên hệ thống')).toBeInTheDocument();
    });

    it('shows "Hết hàng" and disables button when stock is 0', async () => {
        mockSupabaseProduct({stock: 0});
        renderWithRouter();

        const button = await screen.findByRole('button', {name: /hết hàng/i});
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('shows "Đã thêm vào giỏ" when product is already in cart', async () => {
        mockSupabaseProduct({ id: "12" });
        useCartStore.setState({
        items: [{ id: "12", name: "Gà nướng Bản Đôn", price: 100000, image_url: "https://example.com/ga.jpg" }]
        });
        renderWithRouter();

        const button = await screen.findByRole('button', {name: /đã thêm vào giỏ/i});
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('shows "Giỏ hàng đã có 2 món" when cart reaches capacity of 2 items', async () => {
        mockSupabaseProduct({ id: "12" });
        useCartStore.setState({
            items: [
                { id: "1", name: "Cà phê", price: 50000, image_url: "" },
                { id: "2", name: "Trà", price: 60000, image_url: "" }
            ]
        });
        renderWithRouter();

        const button = await screen.findByRole('button', {name: /giỏ hàng đã có 2 món/i});
        expect(button).toBeInTheDocument();
        expect(button).toBeDisabled();
    });

    it('decrements stock and changes button on click "Thêm vào giỏ"', async () => {
        const user = userEvent.setup();
        mockSupabaseProduct({ id: "12", stock: 2});
        renderWithRouter();

        const button = await screen.findByRole('button', {name: /thêm vào giỏ/i});
        expect(button).toBeEnabled();
        expect(screen.getByText('Số lượng còn lại: 2')).toBeInTheDocument();

        await user.click(button);

        expect(screen.getByText('Số lượng còn lại: 1')).toBeInTheDocument();
        expect(await screen.findByRole('button', {name: /đã thêm vào giỏ/i})).toBeDisabled();

    })
})