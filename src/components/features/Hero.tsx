import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"

export function Hero() {
    return (
        <div className="relative h-screen w-full overflow-hidden bg-background">
            {/* Video Background Placeholder */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-background/90 z-10" />
                {/* In production, this would be a <video> tag */}
                <div className="h-full w-full bg-[url('https://images.unsplash.com/photo-1529511582893-2d7e684dd128?q=80&w=2533&auto=format&fit=crop')] bg-cover bg-center animate-slow-zoom" />
            </div>

            {/* Content */}
            <div className="relative z-20 flex h-full flex-col items-center justify-center text-center px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <span className="text-primary font-bold tracking-[0.2em] mb-4 block uppercase text-sm md:text-base">
                        Safety First. Adrenaline Second.
                    </span>
                    <h1 className="text-5xl md:text-8xl font-heading font-bold text-white mb-6 leading-tight tracking-tight">
                        NOTHING ELSE <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                            MATTERS
                        </span>
                    </h1>
                    <p className="max-w-xl mx-auto text-lg md:text-xl text-gray-300 mb-8">
                        Experience the ultimate freedom with USPA-certified instructors.
                        The sky is not the limit—it's just the beginning.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                        <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 rounded-none skew-x-[-12deg] hover:skew-x-0 transition-transform duration-300 border-2 border-primary bg-primary text-white hover:bg-transparent hover:text-primary">
                            <span className="skew-x-[12deg] hover:skew-x-0 inline-block">Book Your Jump</span>
                        </Button>
                        <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 py-6 rounded-none skew-x-[-12deg] hover:skew-x-0 transition-transform duration-300 border-2 border-white text-white hover:bg-white hover:text-black">
                            <span className="skew-x-[12deg] hover:skew-x-0 inline-block">Experience Video</span>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Scroll indicator */}
            <motion.div
                className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 text-white/50"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
            >
                <div className="flex flex-col items-center gap-2">
                    <span className="text-xs uppercase tracking-widest">Scroll to Drop</span>
                    <div className="w-px h-12 bg-gradient-to-b from-transparent via-primary to-transparent" />
                </div>
            </motion.div>
        </div>
    )
}
