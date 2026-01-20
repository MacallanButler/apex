import { Shield, Users, Plane, CheckCircle, Award } from 'lucide-react';
import { motion } from 'framer-motion';

export function TrustSafety() {
    return (
        <section id="safety" className="py-20 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4">

                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
                            TRUSTED BY <span className="text-primary">GRAVITY</span>
                        </h2>
                        <p className="text-muted-foreground max-w-2xl mx-auto">
                            Your safety is our obsession. We operate to the highest standards of the United States Parachute Association.
                        </p>
                    </motion.div>
                </div>

                {/* Badges Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20">
                    {[
                        { icon: Shield, title: "USPA Certified", desc: "Gold Member Rating" },
                        { icon: Users, title: "Expert Staff", desc: "Avg. 4000+ Jumps" },
                        { icon: Plane, title: "Modern Fleet", desc: "Turbine Aircraft" },
                        { icon: CheckCircle, title: "100% Safety", desc: "Perfect Record" },
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-card/50 backdrop-blur-sm border border-white/10 p-6 rounded-lg flex flex-col items-center text-center hover:border-primary/50 transition-colors"
                        >
                            <item.icon className="w-12 h-12 text-primary mb-4" />
                            <h3 className="font-bold text-white mb-1">{item.title}</h3>
                            <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Instructors & Equipment Split */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Instructors */}
                    <div>
                        <h3 className="text-3xl font-heading font-bold text-white mb-8 flex items-center gap-3">
                            <Users className="text-primary" /> Meet Your Instructors
                        </h3>
                        <div className="space-y-6">
                            {[
                                { name: "Sarah 'Hawk' Connor", role: "Chief Instructor", jumps: "12,500+", badges: ["USPA AFF-I", "Tandem Examiner"] },
                                { name: "Mike 'Drop' Johnson", role: "Safety Officer", jumps: "8,200+", badges: ["USPA Pro", "Rigger"] },
                                { name: "Elena Rodriguez", role: "Freefly Coach", jumps: "5,000+", badges: ["World Champion", "Coach"] }
                            ].map((instructor, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-lg bg-card/30 border border-white/5 hover:border-primary/30 transition-colors group">
                                    <div className="w-20 h-20 rounded-full bg-neutral-800 shrink-0 overflow-hidden relative">
                                        {/* Placeholder for avatar */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-neutral-700 flex items-center justify-center font-bold text-2xl text-white/20">
                                            {instructor.name.charAt(0)}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-bold text-white group-hover:text-primary transition-colors">{instructor.name}</h4>
                                        <p className="text-sm text-primary mb-2">{instructor.role} • {instructor.jumps} Jumps</p>
                                        <div className="flex flex-wrap gap-2">
                                            {instructor.badges.map(b => (
                                                <span key={b} className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/80 border border-white/10">{b}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 text-center lg:text-left">
                            <a href="#instructors" className="text-primary hover:underline text-sm font-bold tracking-wider uppercase">View Full Roster &rarr;</a>
                        </div>
                    </div>

                    {/* Equipment Showcase (Tabs placeholder) */}
                    <div className="bg-neutral-900/50 rounded-2xl p-8 border border-white/10">
                        <h3 className="text-3xl font-heading font-bold text-white mb-6 flex items-center gap-3">
                            <Shield className="text-primary" /> Gear & Tech
                        </h3>
                        <p className="text-muted-foreground mb-8">
                            We use only the latest Sigma Tandem Systems and Cypres 2 AADs (Automatic Activation Devices). Every rig is inspected every 180 days by FAA-certified riggers.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Award className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Sigma Tandem System</h4>
                                    <p className="text-sm text-muted-foreground">The industry standard for safety and comfort. Rated for 5000lbs.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Shield className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">Cypres 2 AAD</h4>
                                    <p className="text-sm text-muted-foreground">Computer-controlled backup that automatically deploys the reserve if needed.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                                    <Plane className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-white">PAC 750 XL</h4>
                                    <p className="text-sm text-muted-foreground">Turbine aircraft specifically designed for skydiving operations, maintained to Part 135 standards.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>
        </section>
    )
}
