import React from 'react'
import Link from 'next/link'
import "bootstrap-icons/font/bootstrap-icons.css";


export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
  <div className="container">
    <div className="row">
      <div className="col-md-4 mb-3">
        <h5>About Us</h5>
        <p>VibeShared is source for the latest Movies and entertainment updates.</p>
        <p><Link href='/privacy'>Privacy Policy</Link></p>
      </div>
      <div className="col-md-4 mb-3">
        <h5>Quick Links</h5>
        <ul className="list-unstyled">
          <li><a href="/" className="text-light text-decoration-none">Home</a></li>
          <li><a href="/bollywood" className="text-light text-decoration-none">Bollywood</a></li>
          <li><a href="/kollywood" className="text-light text-decoration-none">Kollywood</a></li>
        </ul>
      </div>
      <div className="col-md-4 mb-3">
        <h5>Follow Us</h5>
        <a href="https://www.facebook.com/profile.php?id=61579951700251https://www.facebook.com/profile.php?id=61579715311716" className="text-light me-3"><i className="bi bi-facebook"></i></a>
        <a href="https://x.com/VibeShared" className="text-light me-3"><i className="bi bi-twitter"></i></a>
        <a href="https://www.instagram.com/vibe_shared/" className="text-light"><i className="bi bi-instagram"></i></a>
      </div>
    </div>
    <div className="text-center mt-3">
      <small>&copy; {new Date().getFullYear()} Vibe Shared. All rights reserved.</small>
    </div>
  </div>
</footer>

  )
}
