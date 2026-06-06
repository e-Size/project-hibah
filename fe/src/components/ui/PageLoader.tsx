"use client";

type PageLoaderProps = {
  children?: React.ReactNode;
  visible?: boolean;
  pathname?: string | null;
};

function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`rounded-md bg-[#ded8cb] ${className}`} />;
}

function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`h-3 rounded-full bg-[#d3cbbd] ${className}`} />;
}

export function SkeletonWireframe() {
  return <HomeSkeleton />;
}

function SkeletonNav({ light = false }: { light?: boolean }) {
  return (
    <div className={`h-16 w-full px-4 sm:px-8 md:px-16 ${light ? "bg-[#faf7f0]" : "bg-transparent"}`}>
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between">
        <SkeletonBlock className="h-9 w-32 bg-white/85" />
        <div className="hidden items-center gap-8 md:flex">
          <SkeletonLine className="w-24 bg-white/75" />
          <SkeletonLine className="w-24 bg-white/75" />
          <SkeletonLine className="w-24 bg-white/75" />
        </div>
        <SkeletonBlock className="h-10 w-36 rounded-lg bg-[#d7c9ad]" />
      </div>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#f2eadc] text-transparent">
      <SkeletonNav />
      <section className="relative flex min-h-[calc(100vh-4rem)] overflow-hidden px-6 sm:px-8 md:px-16">
        <div className="relative z-10 flex w-full max-w-5xl flex-col items-center justify-center gap-5 text-center md:items-start md:text-left">
          <div className="space-y-3">
            <SkeletonLine className="h-9 w-72 max-w-full bg-[#d6c7ae] md:h-12 md:w-[520px]" />
            <SkeletonLine className="h-9 w-64 max-w-full bg-[#d6c7ae] md:h-12 md:w-[460px]" />
          </div>
          <div className="space-y-3">
            <SkeletonLine className="w-80 max-w-full bg-[#cfc3b0]" />
            <SkeletonLine className="w-64 max-w-full bg-[#cfc3b0]" />
          </div>
          <div className="flex gap-3 pt-3">
            <SkeletonBlock className="h-11 w-32 rounded-full bg-white/80" />
            <SkeletonBlock className="h-11 w-36 rounded-full bg-[#c49a2f]" />
          </div>
        </div>
        <SkeletonBlock className="absolute bottom-0 right-4 hidden h-[72%] w-[42%] rounded-t-full bg-[#d9cdb8] md:block" />
      </section>
    </div>
  );
}

function PartnershipSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#e8e8e6] text-transparent">
      <SkeletonNav />
      <main className="px-4 py-16 sm:px-8 md:px-16 md:py-20">
        <section className="flex flex-col items-center text-center">
          <SkeletonBlock className="mb-4 mt-16 h-14 w-80 max-w-[85vw] rounded-none bg-[#9f8951]" />
          <SkeletonLine className="mb-5 h-10 w-72 max-w-[80vw] bg-[#b5a47a]" />
          <div className="space-y-3">
            <SkeletonLine className="w-[620px] max-w-[85vw]" />
            <SkeletonLine className="mx-auto w-[420px] max-w-[70vw]" />
          </div>
        </section>
        <SkeletonBlock className="mx-auto my-10 aspect-[16/7] w-full max-w-6xl bg-[#d8d4cf]" />
        <section className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="flex min-h-28 flex-col items-center justify-center gap-4 rounded-3xl border-4 border-[#c6b68c] bg-[#fdf6f0] p-4">
              <SkeletonLine className="h-8 w-24 bg-[#c8ab4a]" />
              <SkeletonLine className="w-28" />
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}

function CategorySkeleton() {
  return (
    <div className="min-h-screen w-full bg-white text-transparent">
      <SkeletonNav />
      <section className="flex min-h-[430px] flex-col items-center justify-center bg-[radial-gradient(ellipse_at_50%_40%,#f5d0c0_0%,#fceee8_35%,#ffffff_70%)] px-4 text-center">
        <div className="space-y-3">
          <SkeletonBlock className="mx-auto h-12 w-72 max-w-[85vw] rounded-none bg-[#927615]" />
          <SkeletonBlock className="mx-auto h-12 w-96 max-w-[85vw] rounded-none bg-[#927615]" />
        </div>
        <div className="mt-8 flex h-12 w-full max-w-lg items-center rounded-full border-2 border-[#927615] bg-white/80 px-5">
          <SkeletonLine className="w-40" />
        </div>
      </section>
      <section className="px-4 py-12 sm:px-8 md:px-16">
        <SkeletonLine className="mx-auto mb-10 h-8 w-40 bg-[#8eb0d6]" />
        <div className="grid grid-cols-2 gap-8 sm:gap-12 md:grid-cols-3 md:gap-20">
          {[0, 1, 2, 3, 4, 5].map((item) => (
            <div key={item} className="relative pt-10 pr-4">
              <div className="absolute top-0 right-0 bottom-10 left-4 rounded-xl bg-[#E6B5A8]/55 rotate-6" />
              <div className="absolute top-4 right-2 bottom-6 left-2 rounded-xl bg-[#93B1D8]/55 rotate-3" />
              <div className="relative overflow-hidden rounded-t-xl border-4 border-[#927615]/40 bg-white">
                <SkeletonBlock className="aspect-square w-full rounded-none bg-gray-200" />
                <div className="flex justify-center bg-[#d5c391] py-3">
                  <SkeletonLine className="w-20 bg-white/55" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function AboutSkeleton() {
  return (
    <div className="min-h-screen w-full bg-[#f0f0ee] text-transparent">
      <SkeletonNav />
      <SkeletonBlock className="h-[52vh] w-full rounded-none bg-[#d7d2ca]" />
      <section className="px-4 py-12 sm:px-8 md:px-16">
        <div className="mx-auto max-w-4xl space-y-4">
          <SkeletonLine className="mx-auto h-5 w-full" />
          <SkeletonLine className="mx-auto h-5 w-11/12" />
          <SkeletonLine className="mx-auto h-5 w-4/5" />
        </div>
      </section>
      <section className="grid grid-cols-2">
        <SkeletonBlock className="h-64 rounded-none bg-[#d0cbc4]" />
        <div className="space-y-4 bg-[#f5e8e0] p-8">
          <SkeletonLine className="h-5 w-full" />
          <SkeletonLine className="h-5 w-10/12" />
          <SkeletonLine className="h-5 w-8/12" />
        </div>
      </section>
    </div>
  );
}

function EditorSkeleton() {
  return (
    <div className="flex min-h-screen w-full bg-[#f8f3e9] text-transparent">
      <aside className="hidden w-20 border-r border-[#ded6c7] bg-white md:block" />
      <section className="flex flex-1 flex-col">
        <div className="flex h-16 items-center justify-between border-b border-[#ded6c7] bg-white px-4">
          <SkeletonBlock className="h-9 w-32 bg-[#e3d9c8]" />
          <SkeletonBlock className="h-10 w-36 bg-[#d8b354]" />
        </div>
        <div className="grid flex-1 gap-4 p-4 lg:grid-cols-[280px_1fr_260px]">
          <SkeletonBlock className="hidden rounded-lg bg-white lg:block" />
          <div className="flex items-center justify-center">
            <SkeletonBlock className="aspect-square w-full max-w-[520px] rounded-lg bg-white" />
          </div>
          <SkeletonBlock className="hidden rounded-lg bg-white lg:block" />
        </div>
      </section>
    </div>
  );
}

function getSkeleton(pathname?: string | null) {
  if (pathname === "/partnership") return <PartnershipSkeleton />;
  if (pathname === "/category") return <CategorySkeleton />;
  if (pathname === "/about") return <AboutSkeleton />;
  if (pathname === "/editor") return <EditorSkeleton />;
  return <HomeSkeleton />;
}

export default function PageLoader({ children, visible = true, pathname }: PageLoaderProps) {
  return (
    <>
      {visible && (
        <div className="fixed inset-0 z-[9999] overflow-hidden transition-opacity duration-300">
          <div className="animate-skeleton-pulse">
            {getSkeleton(pathname)}
          </div>
        </div>
      )}
      {children}
    </>
  );
}
