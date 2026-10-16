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

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        if (!query.trim()) {
            setProducts([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        searchProducts(query)
            .then((data) => {
                if (!isActive) return;
                if (error) throw error;
                setProducts(data || [])
            })
            .catch((err: unknown) => {
                if (!isActive) return;
                setError(err instanceof Error ? err.message: String(err))
            })
            .finally(() => {
                if (isActive) setLoading(false);
            });
        
        return () => {
            isActive = false;
        }
    }, [query])

    return (
        <>
            <Header />
        </>
    )
}