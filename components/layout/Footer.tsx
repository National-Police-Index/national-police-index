"use client";
import Image from "next/image";
import Link from "next/link";
import { useStaticText } from "@/hooks/useStaticText";
import hrdag from "@/images/hrdag.png";
import ipno from "@/images/IJLA_Specialty_FullColor.png";
// Import images
import invist from "@/images/invist-logo-black.png";
import mljlab from "@/images/mljlab.svg";

import styles from "./styles.module.scss";

const navigation = {
  main: [
    {
      name: "Contact",
      href: "https://invisible.institute/contact",
      target: "_blank",
    },
    {
      name: "Github",
      href: "https://github.com/ayyubibrahimi/us-post-data",
      target: "_blank",
    },
    { name: "About", href: "/about", target: "_self" },
  ],
};

export default function Footer() {
  const { getText } = useStaticText("footer");
  return (
    <footer className={`w-full bg-white ${styles.footer}`}>
      <div className="container-a mx-auto flex flex-col">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <Link
            href="/"
            className={`justify-start text-[#122823] font-bold font-['Inter'] ${styles.siteTitle}`}
          >
            {getText("site-title", "National Police Index")}
          </Link>

          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {navigation.main.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                target={item.target}
                className="text-[#122823] hover:text-[#4F8C7E] text-base sm:text-lg font-normal font-['Inter'] transition-colors duration-200"
              >
                {getText(item.name.toLowerCase(), item.name)}
              </Link>
            ))}
          </nav>
        </div>

        <div
          className={`flex flex-wrap justify-start items-center ${styles.logosContainer}`}
        >
          <a
            className="relative"
            href="https://invisible.institute/national-police-index"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={invist} alt="Invisible Institute logo" />
          </a>
          <a
            className="relative"
            href="https://ip-no.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={ipno} alt="Innocence Project New Orleans logo" />
          </a>
          <a
            className="relative"
            href="https://hrdag.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={hrdag} alt="Human Rights Data Analysis Group logo" />
          </a>
          <a
            className="relative -ml-8"
            href="https://mljlab.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image src={mljlab} alt="MLJ Lab logo" />
          </a>
        </div>
      </div>
    </footer>
  );
}
