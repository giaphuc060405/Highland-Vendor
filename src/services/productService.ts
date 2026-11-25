import { supabase } from "@/utils/supabase";

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    image_url: string;
}


export const fetchProducts = async (): Promise<Product[]> => {
    const { data, error } = await supabase.from("products").select("*");
    if (error) throw error;
    return data || [];
}

export const fetchProductById = async (id: string): Promise<Product | null> => {
    const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
    if (error) throw error;
    return data;
}

export const searchProducts = async (query: string): Promise<Product[]> => {
    const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("name", `%${query.trim()}%`);
    if (error) throw error;
    return data || [];
}