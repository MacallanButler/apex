import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CheckCircle, AlertTriangle, FileText } from "lucide-react"

export function FAQ() {
    return (
        <section id="faq" className="py-20 bg-neutral-950">
            <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Anxiety FAQ */}
                <div>
                    <h2 className="text-3xl font-heading font-bold text-white mb-8">
                        FIRST-TIMER <span className="text-primary">ANXIETY?</span>
                    </h2>
                    <Accordion type="single" collapsible className="w-full">
                        {[
                            { q: "What if the parachute doesn't open?", a: "This is the most common fear! Every system has a Main canopy and a Reserve canopy. The Reserve is inspected by FAA-certified riggers every 180 days. Additionally, we use Cybernetic Parachute Release Systems (Cypres 2) that automatically deploy the reserve if we cross a certain altitude at speed." },
                            { q: "Will I pass out?", a: "Extremely unlikely. You breathe normally in freefall. The sensation is floating, not falling. Most people are surprised by how peaceful it feels once they leave the plane." },
                            { q: "Is it hard on my knees?", a: "Not at all. For tandem jumps, you lift your legs up and the instructor slides in for a landing, taking the impact. It's often softer than jumping off a chair." }
                        ].map((item, i) => (
                            <AccordionItem key={i} value={`item-${i}`} className="border-white/10">
                                <AccordionTrigger className="text-white hover:text-primary hover:no-underline text-lg font-bold">{item.q}</AccordionTrigger>
                                <AccordionContent className="text-muted-foreground">
                                    {item.a}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>

                {/* Requirements Checklist */}
                <div className="bg-blue-950/20 p-8 rounded-2xl border border-blue-500/10">
                    <h2 className="text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
                        <FileText className="text-primary" /> PRE-FLIGHT CHECK
                    </h2>

                    <div className="space-y-6">
                        <div>
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <AlertTriangle className="text-orange-500 w-5 h-5" /> Medical Requirements
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Must be in generally good health</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> No scuba diving within 24 hours</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Not under influence of alcohol/drugs</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Max weight: 230lbs (Call if over)</li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                <FileText className="text-blue-500 w-5 h-5" /> What to Bring
                            </h4>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Valid Government ID (Drivers License/Passport)</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Sneakers/Laced shoes (No sandals/boots)</li>
                                <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500" /> Comfortable, athletic clothing</li>
                            </ul>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/10 text-sm text-muted-foreground">
                            <p className="mb-2 font-bold text-white">Cancellation Policy</p>
                            <p>Full refund for weather-related cancellations. 48-hour notice required for customer-initiated rescheduling.</p>
                        </div>
                    </div>

                </div>

            </div>
        </section>
    )
}
