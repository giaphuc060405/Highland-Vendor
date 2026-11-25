import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCartStore } from "@/store/useCartStore";
import { createOrder } from "@/services/orderService";

export default function Checkout() {
    const navigate = useNavigate();
    const { items, clearCartAfterCheckout } = useCartStore();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const [errors, setErrors] = useState({
        name: '',
        email: '',
        phone: '',
        address: ''
    });

    const validateField = (field: keyof typeof formData, value: string): string => {
        const trimmed = value.trim();
        switch (field) {
            case 'name':
                return trimmed.length < 5 ? 'Phải có ít nhất 5 ký tự' : '';
            case 'email':
                return !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed) ? 'Email sai định dạng: @email.com' : '';
            case 'phone':
                return !/^\d{10,11}$/.test(trimmed) ? 'Phải có 10 hoặc 11 chữ số' : '';
            case 'address':
                return trimmed.length < 5 ? 'Phải có ít nhất 5 ký tự' : '';
        }
    };

    const checkoutMutation = useMutation({
        mutationFn: createOrder,
        onError: (error) => {
            console.error('Error while making the order: ', error);
        }
    });

    useEffect(() => {
        if (checkoutMutation.isSuccess) {
            clearCartAfterCheckout();
        }
    }, [checkoutMutation.isSuccess, clearCartAfterCheckout]);

    useEffect(() => {
        if (!checkoutMutation.isSuccess) {
            const rawStorage = localStorage.getItem('highland_cart');
            const hasItemsInStorage = rawStorage ? JSON.parse(rawStorage)?.items?.length > 0 : false;
            if (items.length === 0 && !hasItemsInStorage) {
                navigate('/', { replace: true });
            }
        }
    }, [items, navigate, checkoutMutation.isSuccess]);

    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof typeof formData;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
        }
    };

    const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const field = name as keyof typeof formData;
        setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
    };

    const handleSubmitOrder = (e: React.SubmitEvent) => {
        e.preventDefault();
        const nextErrors = {
            name: validateField('name', formData.name),
            email: validateField('email', formData.email),
            phone: validateField('phone', formData.phone),
            address: validateField('address', formData.address)
        };
        setErrors(nextErrors);

        if (Object.values(nextErrors).some(Boolean)) return;
        if (items.length === 0 || checkoutMutation.isPending) return;
        checkoutMutation.mutate({
            customer_name: formData.name.trim(),
            customer_email: formData.email.trim(),
            customer_phone: formData.phone.trim(),
            customer_address: formData.address.trim(),
            total_amount: totalAmount,
            items: items.map(item => ({ id: item.id, price: item.price }))
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header />
            {(checkoutMutation.isIdle || checkoutMutation.isPending) && (
                <main className="flex flex-1 flex-col max-w-md md:max-w-dvh w-full mx-auto px-4 py-8">
                    <h1 className="text-3xl font-bold text-center text-[#2B1F1A]">Cổng thanh toán</h1>
                    <form onSubmit={handleSubmitOrder} noValidate className="flex flex-col flex-1">
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Họ và tên</label>
                            <input type="text" name="name" required value={formData.name} onChange={handleInputChange} onBlur={handleInputBlur}
                            placeholder="Nguyễn Văn An" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                            {errors.name && <p className="text-xs italic text-red-700 mt-1">{errors.name}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Email</label>
                            <input type="email" name="email" required value={formData.email} onChange={handleInputChange} onBlur={handleInputBlur}
                            placeholder="nguyenvanan@example.com" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                            {errors.email && <p className="text-xs italic text-red-700 mt-1">{errors.email}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Số điện thoại</label>
                            <input type="tel" name="phone" required value={formData.phone} onChange={handleInputChange} onBlur={handleInputBlur}
                            placeholder="0987654321" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                            {errors.phone && <p className="text-xs italic text-red-700 mt-1">{errors.phone}</p>}
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-bold text-[#2B1F1A] mb-1.5">Địa chỉ nhận hàng</label>
                            <input type="text" name="address" required value={formData.address} onChange={handleInputChange} onBlur={handleInputBlur}
                            placeholder="235/79 Trường Giang, Phường Sài Gòn, Thành phố Hồ Chí Minh" className="w-full bg-[#EFE8DC] border border-stone-800 
                            rounded-lg px-3 py-2 text-[#2B1F1A] placeholder:text-stone-500 focus:outline-none" />
                            {errors.address && <p className="text-xs italic text-red-700 mt-1">{errors.address}</p>}
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

                        <hr className="border-t border-stone-400 my-4" />

                        <div className="flex justify-between items-center mb-6">
                            <span className="text-base font-bold text-[#2B1F1A]">Thành tiền:</span>
                            <span className="text-xl font-bold text-[#2B1F1A]">{totalAmount.toLocaleString("vi-VN")} đ</span>
                        </div>

                        <button type="submit" disabled={checkoutMutation.isPending} className="w-full py-3 bg-[#B5482A]
                        hover:bg-[#9d3c22] disabled:opacity-50 text-white font-medium rounded-lg cursor-pointer
                        transition-colors text-center">
                            {checkoutMutation.isPending ? "Đang xử lý..." : "Đặt hàng"}
                        </button>
                    </form>
                </main>
            )}

            {checkoutMutation.isSuccess && (
                <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-16">
                    <h1 className= "text-2xl md:text-3xl font-bold text-[#2B1F1A] mb-4">
                        Đơn hàng của bạn đã đặt thành công
                    </h1>
                    <p className="text-base text-[#6B5E59]">Bạn có thể rời khỏi trang này</p>
                </main>
            )}

            {checkoutMutation.isError && (
                <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-16">
                    <h1 className= "text-2xl md:text-3xl font-bold text-[#2B1F1A] mb-4">
                        Ôi! Đã có vấn đề xảy ra!
                    </h1>
                    <p className="text-base text-[#6B5E59]">Xin vui lòng thử lại trong vài phút nữa</p>
                </main>
            )}

            <Footer />
        </div>
    )

}