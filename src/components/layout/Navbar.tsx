import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav
            className={cn(
                'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                isScrolled
                    ? 'bg-background/95 backdrop-blur-md border-b py-2'
                    : 'bg-transparent py-4'
            )}
        >
            <div className="container mx-auto px-4 flex items-center justify-between">
                <a href="/" className="text-2xl font-bold font-heading text-primary tracking-tighter">
                    APEX DROP
                </a>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-8">
                    <a href="#experience" className="text-foreground hover:text-primary transition-colors">Experience</a>
                    <a href="#instructors" className="text-foreground hover:text-primary transition-colors">Instructors</a>
                    <a href="#safety" className="text-foreground hover:text-primary transition-colors">Safety</a>
                    <a href="#faq" className="text-foreground hover:text-primary transition-colors">FAQ</a>
                    <Button>Book Now</Button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-foreground"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-background border-b p-4 md:hidden flex flex-col space-y-4 shadow-lg">
                    <a href="#experience" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Experience</a>
                    <a href="#instructors" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Instructors</a>
                    <a href="#safety" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Safety</a>
                    <a href="#faq" className="text-foreground hover:text-primary transition-colors" onClick={() => setIsMobileMenuOpen(false)}>FAQ</a>
                    <Button className="w-full">Book Now</Button>
                </div>
            )}
        </nav>
    );
}
