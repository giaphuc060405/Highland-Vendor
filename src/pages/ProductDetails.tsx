import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { supabase } from "@/utils/supabase";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
}


async function getProductById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

    if (error) throw error;
    return data;
}

export default function ProductDetail() {
    const { id } = useParams<{id: string}>();

    const [productState, setProductState] = useState<{
            product: Product | null;
            loading: boolean;
            error: string | null;
        }>({
            product: null,
            loading: true,
            error: null,
        });
    
    const { product, loading, error } = productState
    
    useEffect(() => {
        let isActive = true;

        if (!id) {
            return () => {
                isActive = false;
            };
        }

        const fetchProductById = async () => {
            try {
                const data = await getProductById(id);
                if (!isActive) return;
                setProductState({
                    product: data || null,
                    loading: false,
                    error: null
                })
            } catch (err: unknown) {
                if (!isActive) return;
                setProductState({
                    product: null,
                    loading: false,
                    error: err instanceof Error ? err.message : String(err),
                });

            }
        };

        fetchProductById();

        return () => {
            isActive = false;
        }
    }, [id])

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header/>
            <main className = "flex flex-1 flex-col items-center justify-center px-4 py-6 bg-[#FAF7F2]">
                {loading ? (
                    <p className = "text-stone-600">Đang tải sản phẩm...</p>) : error || !product ? (
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
                                <button type="button" disabled={product.stock <=0} 
                                    className={`w-full py-3 rounded-lg text-white font-medium 
                                    transition-colors ${
                                    product.stock > 0
                                    ? "bg-[#B5482A] hover:bg-[#9d3c22] cursor-pointer"
                                : "bg-gray-400 cursor-not-allowed"
                                }`}>
                                    {product.stock > 0 ? "Thêm vào giỏ" : "Hết hàng"}
                                </button>
                            </div>
                        </article>
                    )
                }
            </main>
            <Footer/>
        </div>
    )
}