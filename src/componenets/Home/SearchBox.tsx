"use client";

import React, { useState } from "react";

export default function SearchBox() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data.results);
  }

  return (
    <div>
      {/* Search Form */}
      <form className="d-flex" onSubmit={handleSearch}>
        <input
          className="form-control me-2"
          type="search"
          placeholder="Search..."
          aria-label="Search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className="btn btn-outline-success" type="submit">
          Search
        </button>
      </form>

      {/* Results */}
      {results.length > 0 && (
        <ul className="list-group mt-3">
          {results.map((r) => (
            <li key={r.id} className="list-group-item">
              {r.title}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
