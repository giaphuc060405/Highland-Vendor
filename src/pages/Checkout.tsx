import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCartStore } from "@/store/useCartStore";
import { supabase } from "@/utils/supabase";

export default function Checkout() {
    const navigate = useNavigate();
    const { items, clearCartAfterCheckout } = useCartStore();

    const [status, setStatus] = useState<'idle' | 'success' | 'failed'>('idle');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    useEffect(() => {
        if (status === 'idle') {
            const rawStorage = localStorage.getItem('highland_cart');
            const hasItemsInStorage = rawStorage ? JSON.parse(rawStorage)?.items?.length > 0 : false;

            if (items.length === 0 && !hasItemsInStorage) {
                navigate('/', { replace: true});
            }
        }
    }, [items, navigate, status]);

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value}));
    };

    const handleSubmitOrder = async (e: React.SubmitEvent) => {
        e.preventDefault();
        if (items.length === 0 || isSubmitting) return;

        setIsSubmitting(true);

        try {
            const { data: orderData, error: orderError } = await supabase
            .from('orders')
            .insert({
                customer_name: formData.name.trim(),
                customer_email: formData.email.trim(),
                customer_phone: formData.phone.trim(),
                customer_address: formData.address.trim(),
                total_amount: totalAmount,
                status: 'pending'
            })
            .select('id')
            .single();

            if (orderError || !orderData) throw orderError;

            const orderItems = items.map(item => ({
                order_id: orderData.id,
                product_id: item.id,
                quantity: 1,
                price: item.price
            }));

            const { error: itemsError } = await supabase
            .from('order_items')
            .insert(orderItems);

            if (itemsError) throw itemsError;

            clearCartAfterCheckout();
            setStatus('success');
        } catch (error) {
            console.error('Error while making the order: ', error);
            setStatus('failed');
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header />
            {status === 'idle' && (
                <main className="flex flex-1 flex-col max-w-md w-full mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-center text-[#2B1F1A]">Cổng thanh toán</h1>
                    <form onSubmit={handleSubmitOrder} className="flex flex-col flex-1">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Họ và tên</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange}
                            placeholder="Nguyễn Văn An" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange}
                            placeholder="nguyenvanan@example.com" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Số điện thoại</label>
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange}
                            placeholder="0987654321" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Địa chỉ nhận hàng</label>
                            <input type="text" name="address" required value={formData.address} onChange={handleInputChange}
                            placeholder="235/79 Trường Giang, Phường Sài Gòn, Thành phố Hồ Chí Minh" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                        </div>

                        <div className="mb-6">
                            <h2 className="text-sm font-bold text-[#2B1F1A] mb-2">Giỏ hàng của bạn</h2>
                            <div className="space-y-3">
                                {items.map(item => (
                                    <div key={item.id}
                                    className="flex items-center gap-3 p-3 bg-[#EFE8DC] rounded-lg border border-stone-800/20">
                                        <img src = {item.image_url} alt={item.name} className="w-14 h-14 rounded-md object-cover border border-stone-300" />
                                        <div>
                                            <h3 className="font-bold">{item.name}</h3>
                                            <p className="text-xs text-[#554740]">Giá tiền: {Number(item.price).toLocaleString('vi-VN')} đ</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        
                    </form>
                </main>
            )}
        </div>
    )

}