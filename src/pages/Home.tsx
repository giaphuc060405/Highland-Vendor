import { useEffect, useState } from "react"
import Footer from "../components/footer"
import Header from "../components/header"
import SlideShow from "../components/slideshow"
import Card from "../components/card"
import {supabase} from "../utils/supabase"

interface ItemProps {
    id: string,
    name: string,
    price: number,
    image_url: string
}

async function getAllProducts() {
    const {data, error} = await supabase
    .from("products")
    .select()

    if (error) throw error;

    const items: ItemProps[] = data;
    return items;
}

export default function Home() {
    const [products, setProducts] = useState<ItemProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        getAllProducts()
            .then((items) => {
                if (isActive) setProducts(items);
            })
            .catch((error: unknown) => {
                if (!isActive) return;
                console.error("Failed to load products:", error);
                setLoadError(error instanceof Error ? error.message : String(error));
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });

        return () => {
            isActive = false;
        };
    }, []);

    return (
        <>
            <Header/>
            <SlideShow />
            <section className="mx-auto w-full max-w-6xl px-5 py-4">
            <h2 className="mb-4 text-2xl font-bold">Sản phẩm nổi bật</h2>
            <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    <p>Đang tải sản phẩm...</p>
                ) : loadError ? (
                    <p role="alert">Không thể tải sản phẩm: {loadError}</p>
                ) : products.length === 0 ? 
                    <p>Ôi không có gì cả</p>
                : products.map((product) => 
                    <Card key={product.id} image={product.image_url} 
                    title={product.name} price={product.price} />
                )}
            </div>
            </section>
            <Footer />
        </>
    )
}