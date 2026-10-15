import Icon from "../assets/icon.svg"
import { ShoppingCart } from 'lucide-react';

export default function Header() {
    return (
        <header className="bg-[#2F4A3A] w-full flex flex-row justify-center items-center h-15 gap-3 p-2">
            <img src={Icon} alt="Icon" className="w-10 h-10" />
            <input placeholder="Tìm kiếm" className="w-full bg-[#EFE8DC] rounded-2xl px-2 py-1 text-[#2B1F1A]"/>
            <ShoppingCart className="text-amber-50 w-8 h-10" />
        </header>
    )
}