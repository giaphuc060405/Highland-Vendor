import { supabase } from "@/utils/supabase";

export interface CreateOrderParams {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  items: Array<{
    id: string;
    price: number;
  }>;
}

export const createOrder = async (params: CreateOrderParams) => {

  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_name: params.customer_name,
      customer_email: params.customer_email,
      customer_phone: params.customer_phone,
      customer_address: params.customer_address,
      total_amount: params.total_amount,
      status: 'pending',
    })
    .select('id')
    .single();

  if (orderError || !orderData) throw orderError;

  // 2. Tạo chi tiết đơn hàng (order_items)
  const orderItems = params.items.map((item) => ({
    order_id: orderData.id,
    product_id: item.id,
    quantity: 1,
    price: item.price,
  }));

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems);

  if (itemsError) throw itemsError;

  return orderData;
};