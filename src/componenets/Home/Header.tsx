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
        <div className="container">
          {/* Mobile menu */}
          <button
            className="navbar-toggler me-2 border-0"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Logo */}
          <Link className="navbar-brand d-flex align-items-center" href="/">
            <Image src="/VibeShared.png" width={80} height={30} alt="VibeShared Logo" />
            <span className="ms-2 fw-bold d-none d-sm-inline">VibeShared</span>
          </Link>

          <div className="collapse navbar-collapse">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/">Home</Link>
              </li>
              {user?.id && (
                <li className="nav-item">
                  <NotificationDropdown userId={user.id} />
                </li>
              )}
            </ul>

            {/* Desktop search */}
            <div className="d-none d-lg-flex me-4">
              <Link href="/searchBox">
                <i className="bi bi-search"></i>
              </Link>
            </div>

            <div className="d-none d-lg-flex">
              <AuthButton />
            </div>
          </div>

          {/* Mobile search toggle */}
          <div className="d-lg-none d-flex align-items-center">
            <Link
              className="btn btn-link text-dark me-2 p-1"
              href={'/searchBox'}
            >
              <Search size={22} />
            </Link>
            <AuthButton />
          </div>
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
