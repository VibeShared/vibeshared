"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import "@/styles/components/Home/SearchBox.module.css";
interface User {
  _id: string;
  name: string;
  image?: string;
  bio?: string;
  username?: string;
}

export default function SearchUser() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce search to avoid excessive API calls
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      performSearch();
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  async function performSearch() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error("Search failed");
      }
      const data = await res.json();
      setResults(data.users || []);
      setHasSearched(true);
    } catch (error) {
      console.error("Search failed:", error);
      setError("Unable to complete search. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    performSearch();
  }

  return (
    <div className="container my-4">
      <div className="row justify-content-center">
        <div className="col-12 col-md-10 col-lg-8">
          {/* Header */}
         {/* <div className="text-center mb-5">
            <h1 className="display-5 fw-bold text-primary">Find Users</h1>
            <p className="lead text-muted">Discover and connect with people around the world</p>
          </div> /*}

          {/* Search Form */}
          <form onSubmit={handleSubmit} className="card shadow-sm border-0 rounded-4">
            <div className="card-body p-4">
              <div className="input-group input-group-lg">
                <span className="input-group-text bg-transparent border-0 text-muted">
                  <i className="bi bi-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-0 bg-light rounded-end"
                  placeholder="Search..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  aria-label="Search users"
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <small className="text-muted">
                  {results.length > 0 ? `${results.length} results found` : "Start search"}
                </small>
                <button 
                  type="submit" 
                  className="btn btn-primary rounded-pill px-4"
                  disabled={loading || !query.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Searching...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2"></i>
                      Search
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Error Message */}
          {error && (
            <div className="alert alert-danger mt-4 rounded-3 shadow-sm" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          {/* Results */}
          <div className="mt-4">
            {loading && (
              <div className="d-flex justify-content-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            )}

            {!loading && hasSearched && results.length === 0 && (
              <div className="text-center py-5">
                <div className="mb-4">
                  <i className="bi bi-people-fill text-muted" style={{ fontSize: "3rem" }}></i>
                </div>
                <h4 className="text-muted">No users found</h4>
                <p className="text-muted">Try different search terms or check your spelling</p>
              </div>
            )}

            {!loading && results.length > 0 && (
              <div className="row g-3">
                {results.map((user , index) => (
                  <div key={user._id || `user-${index}`} className="col-12">
                    <div className="card shadow-sm border-0 rounded-4 h-100 hover-shadow">
                      <div className="card-body p-4">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <img
                              src={user.image || "https://res.cloudinary.com/dlcrwtyd3/image/upload/v1757470463/3135715_niwuv2.png"}
                              alt={user.name}
                              width={60}
                              height={60}
                              className="rounded-circle object-fit-cover border border-3 border-primary-subtle"
                            />
                          </div>
                          <div className="flex-grow-1 ms-4">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h5 className="card-title mb-1">
                                  <Link 
                                    href={`/profile/${user.username}`} 
                                    className="text-decoration-none text-dark"
                                  >
                                    {user.name}
                                  </Link>
                                </h5>
                                {user.username && (
                                  <p className="text-muted mb-1">@{user.username}</p>
                                )}
                                {user.bio && (
                                  <p className="card-text text-muted small mt-2">{user.bio}</p>
                                )}
                              </div>
                              <Link 
                                href={`/profile/${user.username}`}
                                className="btn btn-outline-primary rounded-pill btn-sm"
                              >
                                View Profile
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bootstrap Icons CSS */}
      <link
        rel="stylesheet"
        href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.3/font/bootstrap-icons.css"
      />

    
    </div>
  );
}