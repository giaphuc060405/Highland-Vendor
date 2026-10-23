import { useEffect, useState } from "react"
import Footer from "../components/footer"
import Header from "../components/header"
import SlideShow from "../components/slideshow"
import Card from "../components/card"
import {supabase} from "../utils/supabase"

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

async function getAllProducts() {
    const { data, error } = await supabase
        .from("products")
        .select();

    if (error) throw error;
    return data || [];
}

export default function Home() {
    const [productsState, setProductsState] = useState<{
        products: Product[];
        loading: boolean;
        error: string | null;
    }>({
        products: [],
        loading: true,
        error: null,
    });

    const { products, loading, error } = productsState;

    useEffect(() => {
        let isActive = true;

        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                if (!isActive) return;
                setProductsState({
                    products: data || [],
                    loading: false,
                    error: null,
                });
            } catch (err: unknown) {
                if (!isActive) return;
                setProductsState({
                    products: [],
                    loading: false,
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        };

        fetchProducts();

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header/>
            <SlideShow />
            <section className="mx-auto w-full max-w-6xl px-5 py-4 bg-[#FAF7F2]">
            <h2 className="max-sm:text-center px-2 mb-4 text-2xl font-bold">Sản phẩm nổi bật</h2>
            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : error ? (
                    <p role="alert">Không thể tải sản phẩm: {error}</p>
                ) : products.length === 0 ? 
                    <p>Ôi không có gì cả</p>
                : products.map((product) => 
                    <Card key={product.id} id={product.id} image={product.image_url} 
                    title={product.name} price={product.price} />
                )}
            </div>
            </section>
            <Footer />
        </div>
    )
}