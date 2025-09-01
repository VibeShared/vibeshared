import React from 'react'

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
  <div className="container">
    <div className="row">
      <div className="col-md-4 mb-3">
        <h5>About Us</h5>
        <p>VibeShared is source for the latest Movies and entertainment updates.</p>
      </div>
      <div className="col-md-4 mb-3">
        <h5>Quick Links</h5>
        <ul className="list-unstyled">
          <li><a href="/" className="text-light text-decoration-none">Home</a></li>
          <li><a href="/movies" className="text-light text-decoration-none">Movies</a></li>
          <li><a href="/about" className="text-light text-decoration-none">About</a></li>
        </ul>
      </div>
      <div className="col-md-4 mb-3">
        <h5>Follow Us</h5>
        <a href="#" className="text-light me-3"><i className="bi bi-facebook"></i></a>
        <a href="#" className="text-light me-3"><i className="bi bi-twitter"></i></a>
        <a href="#" className="text-light"><i className="bi bi-instagram"></i></a>
      </div>
    </div>
    <div className="text-center mt-3">
      <small>&copy; {new Date().getFullYear()} Vibe Shared. All rights reserved.</small>
    </div>
  </div>
</footer>

  )
}
