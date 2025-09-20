"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import NotificationDropdown from "../Notifications/NotificationDropdown";
import AuthButton from "@/componenets/AuthButton";
import styles from "@/styles/componenet/Home/Header.module.css";

export default function Header({ user }: { user: any }) {
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSearch && searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showSearch) setShowSearch(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [showSearch]);

  return (
    <header>
      <nav className={`navbar navbar-expand-lg fixed-top ${styles.navbar} ${isScrolled ? styles.scrolled : ""}`}>
        <div className="container d-flex align-items-center justify-content-between">

          {/* Brand / Logo */}
          <Link className="d-flex align-items-center d-none d-lg-block text-decoration-none" href="/">
            <Image src="/VibeShared.png" width={80} height={30} alt="VibeShared Logo" />
            <span className="ms-2 fw-bold d-none d-lg-inline text-dark  ">VibeShared</span> {/* Hide brand text on md & sm */}
          </Link>

          {/* Navbar items for lg screens */}
          <div className="d-none d-lg-flex align-items-center">
            <ul className="navbar-nav me-4 d-flex flex-row align-items-center">
              <li className="nav-item me-3">
                <Link className="nav-link fw-semibold" href="/">Home</Link>
              </li>
              {user?.id && (
                <li className="nav-item me-3">
                  <NotificationDropdown userId={user.id} />
                </li>
              )}
            </ul>

            <Link href="/searchBox" className="me-3">
              <Search size={22} />
            </Link>

            <AuthButton />
          </div>

          {/* Navbar items for md & sm */}
          <div className="d-flex d-lg-none align-items-center">
            <Link href="/" className="me-3">
              <i className="bi bi-house-door" style={{ fontSize: "1.6rem" }}></i>
            </Link>

            <Link href="/searchBox" className="me-3">
              <Search size={25} />
            </Link>
             <span  className="me-3" >

            {user?.id && (
              <NotificationDropdown userId={user.id}/>
            )}
            </span>

          </div>
          
          <span className="ms-auto d-lg-none">
            <AuthButton />

          </span>

        </div>

        {/* Mobile search box */}
        {showSearch && (
          <div ref={searchContainerRef} className={`container-fluid py-3 d-lg-none ${styles.mobileSearch}`}>
            <div className="container position-relative">
              <button
                className="btn btn-sm position-absolute end-0 top-0 mt-2 me-2"
                onClick={() => setShowSearch(false)}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </nav>

      <div style={{ height: isScrolled ? "80px" : "100px" }}></div>
    </header>
  );
}
