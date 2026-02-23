import canopySunset from '@/assets/canopy-sunset.png'
import planeDoor from '@/assets/plane-door.png'
import altimeterWrist from '@/assets/altimeter-wrist.png'
import dropzoneHangar from '@/assets/dropzone-hangar.png'

export function Gallery() {
    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-heading font-bold text-white mb-8 text-center">
                    CAPTURED MOMENTS
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 h-96 md:h-[600px]">
                    <div
                        className="col-span-2 row-span-2 bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer relative group"
                        style={{ backgroundImage: `url(${canopySunset})` }}
                    >
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                    </div>
                    <div
                        className="bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                        style={{ backgroundImage: `url(${planeDoor})` }}
                    />
                    <div
                        className="bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                        style={{ backgroundImage: `url(${altimeterWrist})` }}
                    />
                    <div
                        className="col-span-2 bg-cover bg-center rounded-2xl hover:scale-[1.02] transition-transform duration-500 cursor-pointer"
                        style={{ backgroundImage: `url(${dropzoneHangar})` }}
                    />
                </div>
            </div>
        </section>
    )
}
