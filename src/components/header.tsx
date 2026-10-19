import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Icon from "../assets/icon.svg"
import { ShoppingCart } from 'lucide-react';

export default function Header() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const currentQuery = searchParams.get('q') || '';
    const [keyword, setKeyWord] = useState(currentQuery);

    const [prevQuery, setPrevQuery] = useState(currentQuery);
    if (prevQuery !== currentQuery) {
        setPrevQuery(currentQuery);
        setKeyWord(currentQuery);
    }

    const handleSearch = (e: React.ChangeEvent<HTMLFormElement>) => {
        e.preventDefault();
        const trimmed = keyword.trim();
        if (trimmed) {
            navigate(`/search?q=${encodeURIComponent(trimmed)}`)
        }
    };


    return (
        <header className="bg-[#2F4A3A] w-full flex flex-row justify-center items-center h-15 gap-3 p-2">
            <Link to="/" className='shrink-0'>
                <img src={Icon} alt="Icon" className="w-10 h-10 hover:opacity-90" />
            </Link>
            <form onSubmit={handleSearch} className='w-full'>
                <input 
                type="search" 
                placeholder="Tìm kiếm" 
                value={keyword}
                onChange={(e) => setKeyWord(e.target.value)}
                className="w-full bg-[#EFE8DC] rounded-2xl px-2 py-1 text-[#2B1F1A]"/>
            </form>
            <ShoppingCart className="text-amber-50 w-8 h-10 shrink-0 cursor-pointer" />
        </header>
    )
}