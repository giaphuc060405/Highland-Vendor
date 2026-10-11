import Icon from "../assets/icon.svg"
import { ShoppingCart } from 'lucide-react';
import { Input } from "@/components/ui/input"

export default function Header() {
    return (
        <header className="bg-[#2F4A3A] w-full flex flex-row justify-center items-center h-15 gap-2 p-2">
            <img src={Icon} alt="Icon" className="w-10 h-10" />
            <Input />
            <ShoppingCart className="text-amber-50" />
        </header>
    )
}