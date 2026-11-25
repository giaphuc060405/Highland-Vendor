import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchProductById, type Product } from "@/services/productService";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCartStore } from "@/store/useCartStore"; 
import ProductDetailSkeleton from "@/components/productDetailSkeleton";


export default function ProductDetail() {
    const { id } = useParams<{ id: string }>();
    const queryClient = useQueryClient();
    const { items: cartItems, addToCart } = useCartStore();
    const {
        data: product,
        isLoading: loading, 
        error,
    } = useQuery({
        queryKey: ['products', id],
        queryFn: () => fetchProductById(id!),
        enabled: !!id,
    });
    const isCartFull = cartItems.length >= 2;
    const isAlreadyInCart = product ? cartItems.some((item) => item.id === product.id) : false;
    const handleAddToCart = async () => {
        if (!product || (product.stock ?? 0) <= 0) return;
        const success = await addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            image_url: product.image_url,
            description: product.description,
        });
        if (success) {
            queryClient.setQueryData<Product | null>(['products', id], (old) => {
                if (!old) return old;
                return { ...old, stock: old.stock - 1 };
            });
        }
    };
    const renderCartButton = () => {
        if (product && product.stock <= 0) {
            return (
                <button type="button" disabled className="w-full py-3 rounded-lg bg-[#E8D5CC] text-[#7C6E68] font-medium cursor-not-allowed">
                    Hết hàng
                </button>
            );
        }
        if (isAlreadyInCart) {
            return (
                <button type="button" disabled className="w-full py-3 rounded-lg bg-[#E8D5CC] text-[#7C6E68] font-medium cursor-not-allowed">
                    Đã thêm vào giỏ
                </button>
            );
        }
        if (isCartFull) {
            return (
                <button type="button" disabled className="w-full py-3 rounded-lg bg-[#E8D5CC] text-[#7C6E68] font-medium cursor-not-allowed">
                    Giỏ hàng đã có 2 món 
                </button>
            );
        }
        return (
            <button 
                type="button" 
                onClick={handleAddToCart}
                className="w-full py-3 rounded-lg bg-[#B5482A] hover:bg-[#9d3c22] text-white font-medium cursor-pointer transition-colors"
            >
                Thêm vào giỏ
            </button>
        );
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header/>
            <main className = "flex flex-1 flex-col items-center justify-center px-4 py-6">
                {loading ? (
                    <ProductDetailSkeleton />) : error || !product ? (
                        <div className="flex flex-col items-center justify-center text-center py-16">
                            <h1 className="text-2xl font-bold text-[#2B1F1A]">Sản phẩm không tồn tại</h1>
                            <p className="text-base text-[#6B5E59] max-w-xs">Có thể sản phẩm đã bị xóa hay không có trên hệ thống</p>
                        </div>
                    ) : (
                        <article className="w-full max-w-5xl overflow-hidden rounded-lg md:grid md:grid-cols-2">
                            <div className="w-full aspect-4/3 bg-stone-100 overflow-hidden md:aspect-auto md:min-h-112">
                                <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            </div>

                            <div className="flex flex-col justify-center space-y-4 p-6 md:p-8">
                                <h1 className="text-2xl font-bold text-[#2B1F1A]">{product.name}</h1>
                                <p className="text-xl font-bold text-[#2B1F1A]">{Number(product.price).toLocaleString("vi-Vn")} đ</p>
                                <p className="text-base font-normal">Số lượng còn lại: {product.stock}</p>
                                <p className="text-base font-normal">{product.description}</p>
                                {renderCartButton()}
                            </div>
                        </article>
                    )
                }
            </main>
            <Footer/>
        </div>
    )
}