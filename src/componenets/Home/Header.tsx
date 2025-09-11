"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import SearchBox from "@/componenets/Home/SearchBox";
import AuthButton from "@/componenets/AuthButton";
import styles from "@/styles/componenet/Home/Header.module.css";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close search when clicking outside (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showSearch && searchContainerRef.current && 
          !searchContainerRef.current.contains(e.target as Node)) {
        setShowSearch(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSearch]);

  // Close search when pressing Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearch) {
        setShowSearch(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [showSearch]);

  return (
    <header>
      <nav
        className={`navbar navbar-expand-lg fixed-top ${styles.navbar} ${
          isScrolled ? styles.scrolled : ""
        }`}
      >
        <div className="container">

          {/* Mobile menu button */}
            <button
              className="navbar-toggler me-2 border-0"
              type="button"
              data-bs-toggle="offcanvas"
              data-bs-target="#mobileMenu"
              aria-controls="mobileMenu"
              aria-label="Toggle navigation"
              style={{ boxShadow: 'none' }}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
          

          {/* Mobile controls (left side) */}
          <div className="d-flex  align-items-center">
            {/* Logo - Always visible */}
          <Link
            className="navbar-brand d-flex align-items-center"
            href="/"
            aria-label="Vibe Shared Home"
          >
            <Image
              src="/VibeShared.png"
              width={80}
              height={30}
              alt="Vibe Shared Logo"
              priority
              className={styles.logo}
            />
            <span className="ms-2 fw-bold d-none d-sm-inline">
              VibeShared
            </span>
          </Link>

           
          </div>

          {/* Desktop Menu & Search */}
          <div className="collapse navbar-collapse">
            {/* Navigation Links */}
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/bollywood">
                  Bollywood
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link fw-semibold" href="/kollywood">
                  Kollywood
                </Link>
              </li>
            </ul>

            {/* Desktop Search */}
            <div className="d-none d-lg-flex me-4" style={{ maxWidth: "400px", width: "100%" }}>
              <SearchBox />
            </div>

            {/* Auth Button */}
            <div className="d-none d-lg-flex">
              <AuthButton />
            </div>
          </div>

          {/* Mobile Auth Button (visible on mobile) */}
          <div className="d-lg-none d-flex align-items-center">
             {/* Mobile search toggle */}
            <button
              className="btn btn-link text-dark me-2 p-1"
              aria-label={showSearch ? "Close search" : "Open search"}
              onClick={() => setShowSearch(!showSearch)}
            >
              {showSearch ? <X size={22} /> : <Search size={22} />}
            </button>
            <AuthButton />
          </div>
        </div>

        {/* Mobile Search Box (appears below navbar) */}
        {showSearch && (
          <div 
            ref={searchContainerRef}
            className={`container-fluid py-3 d-lg-none ${styles.mobileSearch}`}
          >
            <div className="container position-relative">
              <SearchBox />
              <button
                className="btn btn-sm position-absolute end-0 top-0 mt-2 me-2"
                onClick={() => setShowSearch(false)}
                aria-label="Close search"
                style={{ zIndex: 10 }}
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Offcanvas Mobile Menu */}
      <div
        className="offcanvas offcanvas-start"
        tabIndex={-1}
        id="mobileMenu"
        aria-labelledby="mobileMenuLabel"
      >
        <div className="offcanvas-header">
          <h5 id="mobileMenuLabel" className="offcanvas-title d-flex align-items-center">
            <Image
              src="/VibeShared.png"
              width={60}
              height={24}
              alt="Vibe Shared Logo"
              className="me-2"
            />
            Menu
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold py-3 border-bottom"
                href="/"
                data-bs-dismiss="offcanvas"
              >
                Home
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold py-3 border-bottom"
                href="/bollywood"
                data-bs-dismiss="offcanvas"
              >
                Bollywood
              </Link>
            </li>
            <li className="nav-item">
              <Link
                className="nav-link fw-semibold py-3 border-bottom"
                href="/kollywood"
                data-bs-dismiss="offcanvas"
              >
                Kollywood
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Add spacer to prevent content from being hidden under fixed header */}
      <div style={{ height: isScrolled ? '80px' : '100px' }}></div>
    </header>
  );
}