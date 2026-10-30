import Header from "@/components/header";
import Footer from "@/components/footer";
import { useCartStore } from "@/store/useCartStore";
import { Trash } from "lucide-react";

export default function Cart() {
    const { items, removeFromCart } = useCartStore();
    
    const totalAmount = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

    return (
        <div className="min-h-screen flex flex-col bg-[#FAF7F2]">
            <Header/>
            <main className="flex flex-1 flex-col max-w-md w-full mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-center text-[#2B1F1A] mb-8">Giỏ hàng của bạn</h1>
                {items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center py-16 gap-5">
                            <h2 className="text-2xl font-medium text-[#2B1F1A]">Giỏ hàng đang trống</h2>
                            <p className="text-base text-[#6B5E59] max-w-xs">Hãy thêm vào</p>
                    </div>
                ): (
                    <div className="flex flex-col flex-1">
                        <div className="space-y-4">
                            {items.map((item) => (
                                <div key={item.id} className="flex items-center gap-3 p-3 bg-[#EFE8DC]
                                rounded-xl border border-stone-800/80 shadow-xs">   
                                    <img src={item.image_url} alt={item.name} 
                                    className="w-16 h-16 rounded-md object-cover border border-stone-300"/>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="font-bold text-[#2B1F1A] text-sm-truncate">{item.name}</h2>
                                        <p className="text-xs text-[#554740] mt-1">Giá thành: {Number(item.price).toLocaleString('vi-VN')} đ</p>
                                    </div>
                                    <button type="button" onClick={() => removeFromCart(item.id)}
                                        className="text-[#c0392b] hover:text-red-700 p-2 cursor-pointer transition-colors"
                                        title="Delete from cart">
                                            <Trash className="w-5 h-5" />
                                        </button>
                                </div>
                            ))}
                        </div>
                        <hr className="border-t border-stone-400 my-6" />
                        <div className="flex justify-between items-center mb-6">
                            <span className="text-base font-bold text=[#2B1F1A]">Thành tiền:</span>
                            <span className="text-xl font-bold text=[#2B1F1A]">{totalAmount.toLocaleString('vi-VN')}</span>
                        </div>
                        <button type="button" className="w-full py-3 bg-[#B5482A] hover:bg-[#9d3c22]
                        text-white font-medium rounded-lg cursor-pointer transition-colors text-center">
                            Thanh toán
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    )
}