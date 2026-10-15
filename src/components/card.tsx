import { Button } from "@/components/ui/button"
interface CardProps {
    image: string,
    title: string,
    price: number
}

export default function Card({image, title, price}: CardProps) {
    return (
        <article className="flex w-60 flex-col items-center gap-3 rounded-2xl border border-[#000000] bg-white p-4">
            <img src={image} alt={title} className="h-40 w-full object-contain" />
            <p className="line-clamp-2 min-h-12 text-center text-lg font-bold">{title}</p>
            <p className="text-base font-medium">{price.toLocaleString('vi-VN')} đ</p>
            <Button variant="outline" size="default" className="w-full bg-[#B5482A]">
                Xem chi tiết
            </Button>
        </article>
        
    );
}