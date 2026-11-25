import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import Header from "../components/header";
import Footer from "@/components/footer";
import Card from "../components/card";
import { searchProducts } from "@/services/productService";


export default function SearchResult() {
    const [searchParams] = useSearchParams();
    const query = (searchParams.get("q") || "").trim();

    const {
        data: products = [],
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['products', 'search', query],
        queryFn: () => searchProducts(query),
        enabled: !!query,
    })

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header />
            <main className="mx-auto w-full max-w-6xl px-5 py-4 bg-[#FAF7F2]">
                {!query ? (
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
                        {products.map((p) => (
                            <Card
                                key={p.id}
                                id={p.id}
                                image={p.image_url}
                                title={p.name}
                                price={p.price}
                            />
                        ))}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}