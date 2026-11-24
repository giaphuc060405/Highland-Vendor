export default function ProductCardSkeleton () {
    return (
        <div role="status" aria-label="Đang tải sản phẩm" className="flex w-60 flex-col items-center gap-3
        rounded-2xl border border-stone-200 bg-white p-4 animate-pulse">
            <div className="h-40 w-full rounded-xl bg-stone-200 " />
            <div className="w-full min-h-12 flex flex-col items-center justify-center gap-5">
                <div className="h-4 w-4/5 rounded bg-stone-200" />
                <div className="h-4 w-4/5 rounded bg-stone-200" />
            </div>
            <div className="h-10 w-full rounded-2xl bg-stone-200" />
            <span className="sr-only">Đang tải...</span>
        </div>
    )
}