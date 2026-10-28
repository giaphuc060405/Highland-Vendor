import { Link } from "react-router-dom";

interface CardProps {
    id: string
    image: string,
    title: string,
    price: number
}

export default function Card({id, image, title, price}: CardProps) {
    return (
        <article className="flex w-60 flex-col items-center gap-3 rounded-2xl border border-[#000000] bg-white p-4">
            <img src={image} alt={title} className="h-40 w-full object-contain" />
            <p className="line-clamp-2 min-h-12 text-center text-lg font-bold">{title}</p>
            <p className="text-base font-medium">{price.toLocaleString('vi-VN')} đ</p>
            <Link to={`/product/${id}`} className="w-full">
                <button className="w-full h-10 text-[#FFFFFF] rounded-2xl hover:cursor-pointer hover:bg-[#eea38e] bg-[#B5482A]">
                    Xem chi tiết
                </button>
            </Link>
        </article>
        
    );
}