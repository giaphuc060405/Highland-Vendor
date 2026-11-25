import { useQuery } from "@tanstack/react-query"
import Footer from "../components/footer"
import Header from "../components/header"
import SlideShow from "../components/slideshow"
import Card from "../components/card"
import { fetchProducts } from "@/services/productService"
import ProductCardSkeleton from "@/components/productCardSkeleton"


export default function Home() {
    const {
        data: products = [],
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ['products'],
        queryFn: fetchProducts
    })

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header/>
            <SlideShow />
            <section className="mx-auto w-full max-w-6xl px-5 py-4 bg-[#FAF7F2]">
            <h2 className="max-sm:text-center px-2 mb-4 text-2xl font-bold">Sản phẩm nổi bật</h2>
            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {error && (
                <div role="alert" className="col-span-full w-full p-4 bg-red-100 text-red-700 rounded-md">
                    Không thể tải sản phẩm: {error instanceof Error ? error.message : "Đã có lỗi xảy ra"}
                </div>
                )}
                {loading ? (
                    [...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)
                ) : (
                    products.map((p) => <Card key={p.id} id={p.id} image={p.image_url} title={p.name} price={p.price} />)
                )}
            </div>
            </section>
            <Footer />
        </div>
    )
}