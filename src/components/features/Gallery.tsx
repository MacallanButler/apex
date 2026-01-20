export function Gallery() {
    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-heading font-bold text-white mb-8 text-center">
                    CAPTURED MOMENTS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96 md:h-[600px]">
                    <div className="col-span-2 row-span-2 bg-[url('https://images.unsplash.com/photo-1544465544-1b71aee9dfa3?q=80&w=2692&auto=format&fit=crop')] bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer relative group">
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div className="bg-[url('https://images.unsplash.com/photo-1505672675303-2753d6efa886?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer" />
                    <div className="bg-[url('https://images.unsplash.com/photo-1473187983305-f615310e7daa?q=80&w=2670&auto=format&fit=crop')] bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer" />
                    <div className="col-span-2 bg-[url('https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?q=80&w=2573&auto=format&fit=crop')] bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer" />
                </div>
            </div>
        </section>
    )
}
