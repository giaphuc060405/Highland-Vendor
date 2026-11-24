export default function ProductDetailSkeleton() {
    return (
        <article
            role="status"
            aria-label="Đang tải chi tiết sản phẩm"
            className="w-full max-w-5xl overflow-hidden rounded-lg md:grid md:grid-cols-2 animate-pulse"
        >
            <div className="w-full aspect-4/3 bg-stone-200 overflow-hidden md:aspect-auto md:min-h-112 rounded-lg" />
            <div className="flex flex-col justify-center space-y-4 p-6 md:p-8">
                <div className="h-8 w-3/4 rounded-md bg-stone-200" />
                <div className="h-7 w-1/3 rounded-md bg-stone-200" />
                <div className="h-4 w-1/4 rounded bg-stone-200" />
                <div className="space-y-2 pt-1">
                    <div className="h-3.5 w-full rounded bg-stone-200" />
                    <div className="h-3.5 w-full rounded bg-stone-200" />
                    <div className="h-3.5 w-5/6 rounded bg-stone-200" />
                    <div className="h-3.5 w-2/3 rounded bg-stone-200" />
                </div>
                <div className="h-12 w-full rounded-lg bg-stone-200 mt-2" />
            </div>
            <span className="sr-only">Đang tải...</span>
        </article>
    );
}
