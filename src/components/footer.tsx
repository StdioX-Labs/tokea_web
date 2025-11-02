import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className="bg-muted/50 border-t">
			<div className="container px-4 sm:px-6 md:px-8 py-8 sm:py-12 md:py-16">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 md:gap-12">
					{/* Company Info */}
					<div className="space-y-4">
						<h3 className="text-lg sm:text-xl font-bold font-headline">TOKEA</h3>
						<p className="text-sm text-muted-foreground leading-relaxed">
							Africa&apos;s leading events and festivals access control company.
						</p>
						<div className="flex gap-4">
							<a
								href="#"
								className="text-muted-foreground hover:text-accent transition-colors"
								aria-label="Facebook"
							>
								<Facebook className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-accent transition-colors"
								aria-label="Twitter"
							>
								<Twitter className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-accent transition-colors"
								aria-label="Instagram"
							>
								<Instagram className="w-5 h-5" />
							</a>
							<a
								href="#"
								className="text-muted-foreground hover:text-accent transition-colors"
								aria-label="LinkedIn"
							>
								<Linkedin className="w-5 h-5" />
							</a>
						</div>
					</div>

					{/* Quick Links */}
					<div className="space-y-4">
						<h3 className="text-lg sm:text-xl font-bold font-headline">Quick Links</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="/events"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									Events
								</Link>
							</li>
							<li>
								<Link
									href="/about"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									About Us
								</Link>
							</li>
							<li>
								<Link
									href="/contact"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</div>

					{/* Legal */}
					<div className="space-y-4">
						<h3 className="text-lg sm:text-xl font-bold font-headline">Legal</h3>
						<ul className="space-y-2 text-sm">
							<li>
								<Link
									href="/privacy"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href="/terms"
									className="text-muted-foreground hover:text-accent transition-colors"
								>
									Terms of Service
								</Link>
							</li>
						</ul>
					</div>

					{/* Contact Info */}
					<div className="space-y-4">
						<h3 className="text-lg sm:text-xl font-bold font-headline">Contact</h3>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li>Inside Wonderjoy Ridgeways gardens</li>
							<li>P.O.Box 2013 -00900 Kiambu</li>
							<li>
								<a
									href="tel:0796555111"
									className="hover:text-accent transition-colors"
								>
									Tel: 0796555111
								</a>
							</li>
							<li>
								<a
									href="mailto:info@tokea.com"
									className="hover:text-accent transition-colors"
								>
									info@tokea.com
								</a>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-border">
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4">
						<p className="text-xs sm:text-sm text-muted-foreground text-center sm:text-left">
							© {currentYear} TOKEA. All rights reserved.
						</p>

						<div className="flex items-center gap-2 text-sm sm:text-base">
							<span className="text-muted-foreground">Powered by</span>
							<a
								href="https://soldoutafrica.com/"
								target="_blank"
								rel="noopener noreferrer"
								className="font-bold font-headline text-accent hover:text-accent/80 transition-colors"
							>
								SoldOutAfrica
							</a>
						</div>

						<div className="flex gap-4 text-xs sm:text-sm">
							<Link
								href="/privacy"
								className="text-muted-foreground hover:text-accent transition-colors"
							>
								Privacy Policy
							</Link>
							<span className="text-muted-foreground">•</span>
							<Link
								href="/terms"
								className="text-muted-foreground hover:text-accent transition-colors"
							>
								Terms
							</Link>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}

