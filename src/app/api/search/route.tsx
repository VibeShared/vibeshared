import { NextResponse } from "next/server";

// Example static data (replace with DB later)
const movies = [
  { id: 1, title: "Pathaan" },
  { id: 2, title: "War" },
  { id: 3, title: "Jawan" },
  { id: 4, title: "Animal" },
  { id: 5, title: "RRR" },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  const results = movies.filter((movie) =>
    movie.title.toLowerCase().includes(q)
  );

  return NextResponse.json({ results });
}
