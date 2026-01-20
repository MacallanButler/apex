export function Footer() {
    return (
        <footer className="bg-secondary text-secondary-foreground py-12">
            <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                    <h3 className="text-2xl font-bold font-heading text-primary mb-4">APEX DROP</h3>
                    <p className="text-muted-foreground">
                        Safety First, Adrenaline Second. experience the ultimate thrill with certified professionals.
                    </p>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#experience" className="hover:text-primary">Tandem Jumps</a></li>
                        <li><a href="#training" className="hover:text-primary">Solo Certification</a></li>
                        <li><a href="#gift" className="hover:text-primary">Gift Vouchers</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Support</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li><a href="#faq" className="hover:text-primary">FAQ</a></li>
                        <li><a href="#weather" className="hover:text-primary">Weather Policy</a></li>
                        <li><a href="#contact" className="hover:text-primary">Contact Us</a></li>
                    </ul>
                </div>

                <div>
                    <h4 className="font-bold mb-4">Contact</h4>
                    <p className="text-sm text-muted-foreground">
                        123 Dropzone Lane,<br />
                        Sky City, CA 90210<br />
                        (555) 123-4567<br />
                        info@apexdrop.com
                    </p>
                </div>
            </div>
            <div className="container mx-auto px-4 mt-8 pt-8 border-t border-secondary-foreground/20 text-center text-sm text-muted-foreground">
                © {new Date().getFullYear()} Apex Drop Skydiving. All rights reserved. USPA Member.
            </div>
        </footer>
    )
}
