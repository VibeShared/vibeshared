"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import { Search } from "lucide-react";
import SearchBox from "@/componenets/Home/SearchBox";
import AuthButton from "@/componenets/Home/AuthButton";
import styles from "@/styles/componenet/Home/Header.module.css";

export default function Header() {
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header>
      <nav
        className={`navbar navbar-expand-lg navbar-light shadow-sm fixed-top ${styles.navbar}`}
      >
        <div className="container">
          {/* Mobile Menu Button */}
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#mobileMenu"
            aria-controls="mobileMenu"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* Logo */}
          <Link
            className="navbar-brand d-flex align-items-center"
            href="/"
            aria-label="Vibe Shared Home"
          >
            <Image
              src="/VibeShared.png"
              width={100}
              height={40}
              alt="Vibe Shared Logo"
              priority
            />
            <span className="ms-2 fw-bold d-none d-sm-inline">VibeShared</span>
          </Link>

          {/* Mobile Search Button + AuthButton wrapper */}
          <div className="d-flex align-items-center d-lg-none ms-auto">
            {/* Mobile Search Button */}
            <button
              className="btn me-2"
              aria-label="Open search"
              onClick={() => setShowSearch(!showSearch)}
            >
              <Search size={22} />
            </button>

            {/* Mobile Auth Button */}
            <AuthButton />
          </div>

          {/* Desktop Menu */}
          <div className="collapse navbar-collapse justify-content-between">
            <ul className="navbar-nav ms-4 mb-2 mb-lg-0">
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
            <div className="d-none d-lg-flex me-3">
              <SearchBox />
            </div>

            {/* Auth Button (Desktop right side) */}
            <AuthButton />
          </div>
        </div>
      </nav>

      {/* Mobile Search Box */}
      {showSearch && (
        <div className="bg-white shadow-sm p-3 d-lg-none fixed-top mt-5">
          <SearchBox />
        </div>
      )}

      {/* Offcanvas Menu */}
      <div
  className="offcanvas offcanvas-start"
  tabIndex={-1}
  id="mobileMenu"
  aria-labelledby="mobileMenuLabel"
>
  <div className="offcanvas-header">
    <h5 id="mobileMenuLabel">Menu</h5>
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
          className="nav-link fw-semibold"
          href="/"
          onClick={() => window.location.href = "/"} // Reload page
        >
          Home
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className="nav-link fw-semibold"
          href="/bollywood"
          onClick={() => window.location.href = "/bollywood"} // Reload page
        >
          Bollywood
        </Link>
      </li>
      <li className="nav-item">
        <Link
          className="nav-link fw-semibold"
          href="/kollywood"
          onClick={() => window.location.href = "/kollywood"} // Reload page
        >
          Kollywood
        </Link>
      </li>
    </ul>
  </div>
</div>
    </header>
  );
}
