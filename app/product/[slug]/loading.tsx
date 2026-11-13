export default function ProductLoading() {
  return (
    <div className="container-shell py-8 lg:py-14">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <div>
          <div className="aspect-[4/5] animate-pulse rounded-2xl bg-zinc-100" />
          <div className="mt-3 flex gap-2.5">
            <div className="aspect-[4/5] w-20 animate-pulse rounded-xl bg-zinc-100" />
            <div className="aspect-[4/5] w-20 animate-pulse rounded-xl bg-zinc-100" />
          </div>
        </div>
        <div className="space-y-4">
          <div className="h-3 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-zinc-100" />
          <div className="h-3 w-40 animate-pulse rounded bg-zinc-100" />
          <div className="h-8 w-32 animate-pulse rounded bg-zinc-100" />
          <div className="h-20 w-full animate-pulse rounded bg-zinc-100" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-10 w-12 animate-pulse rounded-lg bg-zinc-100" />
            ))}
          </div>
          <div className="h-12 w-full animate-pulse rounded-full bg-zinc-100" />
        </div>
      </div>
    </div>
  );
}
