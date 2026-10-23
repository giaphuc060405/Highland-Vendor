import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "@/components/footer";
import Card from "../components/card";
import { supabase } from "@/utils/supabase";

interface Product {
    id: string;
    name: string;
    price: number;
    image_url: string;
}

async function searchProducts(query: string) {
    const { data, error} = await supabase
        .from('products')
        .select('*')
        .ilike('name', `%${query.trim()}%`)
    
    if (error) throw error;
    return data || [];
}

export default function SearchResult() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get("q") || "";

    const [searchState, setSearchState] = useState<{
        query: string;
        products: Product[];
        error: string | null;
    }>({
        query: "",
        products: [],
        error: null,
    });

    const trimmedQuery = query.trim();
    const loading = Boolean(trimmedQuery && searchState.query !== trimmedQuery);
    const products = trimmedQuery && searchState.query === trimmedQuery ? searchState.products : [];
    const error = trimmedQuery && searchState.query === trimmedQuery ? searchState.error : null;

    useEffect(() => {
        if (!trimmedQuery) {
            return;
        }

        let isActive = true;

        const fetchProducts = async () => {
            try {
                const data = await searchProducts(trimmedQuery);
                if (!isActive) return;
                setSearchState({
                    query: trimmedQuery,
                    products: data,
                    error: null,
                });
            } catch (err: unknown) {
                if (!isActive) return;
                setSearchState({
                    query: trimmedQuery,
                    products: [],
                    error: err instanceof Error ? err.message : String(err),
                });
            }
        };

        fetchProducts();

        return () => {
            isActive = false;
        };
    }, [trimmedQuery]);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header />
            <main className="mx-auto w-full max-w-6xl px-5 py-4 bg-[#FAF7F2]">
                {!trimmedQuery ? (
                    <div>
                        <p className = "text-stone-600">Hãy nhập từ khóa để tìm kiếm</p>
                    </div>
                ) : loading ? (
                    <p className = "text-stone-600">Đang trả về kết quả</p>
                ) : error || products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16">
                            <h1 className="text-2xl font-bold text-[#2B1F1A]">Không tìm thấy kết quả</h1>
                            <p className="text-base text-[#6B5E59] max-w-xs">Hãy thử một từ khóa khác</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {products.map((product) => (
                            <Card
                                key={product.id}
                                id={product.id}
                                image={product.image_url}
                                title={product.name}
                                price={product.price}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}