export default function ShopLoading() {
  return (
    <div>
      <div className="border-b border-zinc-200/70 bg-[#F7F8F7]">
        <div className="container-shell py-10">
          <div className="h-3 w-28 animate-pulse rounded bg-zinc-200/70" />
          <div className="mt-5 h-9 w-52 animate-pulse rounded bg-zinc-200/70" />
          <div className="mt-3 h-3 w-80 max-w-full animate-pulse rounded bg-zinc-200/60" />
        </div>
      </div>
      <div className="container-shell py-9">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr] lg:gap-10">
          <div className="hidden space-y-5 lg:block">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-zinc-100" />
                <div className="h-8 animate-pulse rounded-lg bg-zinc-100" />
                <div className="h-8 animate-pulse rounded-lg bg-zinc-100" />
              </div>
            ))}
          </div>
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div className="h-10 w-64 animate-pulse rounded-xl bg-zinc-100" />
              <div className="h-10 w-36 animate-pulse rounded-xl bg-zinc-100" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white"
                >
                  <div className="aspect-[3/4] animate-pulse bg-zinc-100" />
                  <div className="space-y-2 p-4">
                    <div className="h-2.5 w-16 animate-pulse rounded bg-zinc-100" />
                    <div className="h-3.5 w-3/4 animate-pulse rounded bg-zinc-100" />
                    <div className="h-2.5 w-24 animate-pulse rounded bg-zinc-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
