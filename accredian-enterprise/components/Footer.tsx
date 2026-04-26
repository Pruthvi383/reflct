import Link from "next/link";
import { Linkedin, Twitter } from "lucide-react";

import { footerLinks } from "@/lib/mockData";

export const Footer = () => {
  return (
    <footer id="footer" className="bg-ink text-white">
      <div className="section-shell mx-auto max-w-7xl">
        <div className="grid gap-12 border-b border-white/10 pb-12 lg:grid-cols-[1.1fr_1fr]">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand text-lg font-bold text-white">
                A
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-blue-200">Accredian</p>
                <p className="text-sm font-semibold">Enterprise</p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-300">
              Helping organizations build high-performing teams through world-class digital learning, mentorship, and outcome-driven program delivery.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {footerLinks.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-100">{group.title}</h3>
                <ul className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="text-sm text-slate-300 transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Accredian Enterprise Clone. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="https://linkedin.com" className="transition hover:text-white" aria-label="LinkedIn">
              <Linkedin className="h-5 w-5" />
            </Link>
            <Link href="https://twitter.com" className="transition hover:text-white" aria-label="Twitter">
              <Twitter className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
