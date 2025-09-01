import React from 'react'
import style from "@/styles/componenet/bollywood/slug.module.css"
import Image from 'next/image'
import Likebutton from '@/componenets/Home/Likebutton'
import { Metadata } from 'next'

interface Kolly {
  _id: string;
  name: string;
  release: string;
  image: string;
  likes: number;
  day: string[];
  description: string;
  likedBy: string[];
  
}


export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params; // ✅ await the params object
  const id = slug;
  const res = await fetch(`http://localhost:3000/api/kollywood/${id}`, { cache: "no-store" });
  const data = await res.json();
  const movie = data.result;

  return {
    title: `${movie.name} | Kollywood Movies`,
    description: movie.description,
    openGraph: {
      title: movie.name,
      description: movie.description,
      url: `https://yourdomain.com/kollywood/${id}`,
      type: "video.movie",
      images: [
        {
          url: movie.image,
          alt: movie.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: movie.name,
      description: movie.description,
      images: [movie.image],
    },
    other: {
     
      "application/ld+json": JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.name,
        "image": movie.image,
        "description": movie.description,
        "datePublished": movie.release,
        "aggregateRating": {
          "@type": "AggregateRating",
          "likeValue": (movie.likes / 10).toFixed(1), // Example: converting likes to rating
          "likeCount": movie.likes
        },
        "author": {
          "@type": "Organization",
          "name": "Vibe Shared"
        },
        "potentialAction": {
          "@type": "WatchAction",
          "target": `https://yourdomain.com/kollywood/${id}`
        }
      })
    }
  };
}


export default async function Page({ params }: { params:{ slug: string } }) {
  interface ApiResponse {
    result: Kolly;
  }
  

  const id = params.slug; 

  const fetchKollywood = async (): Promise<ApiResponse> => {
    const res = await fetch(`http://localhost:3000/api/kollywood/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Bollywood data");
    }

    return res.json();
  };

  const data = await fetchKollywood();
  const movie = data.result;
  const totalB = movie.day.reduce((sum, val) => sum + parseFloat(val), 0);

  return (
     

   <div className={`container ${style.container}`}>

  {/* Title + Release Date */}
   <div className="row align-items-center mb-3">
    <div className="col-12 col-md-6">
      <h1 className="h4 h-md-1">{movie.name}</h1>
    </div>
    <div className="col-12 col-md-6 text-md-end">
      <em><b>Release Date:</b> {movie.release}</em>
    </div>
  </div>

  {/* Poster + Trailer */}
  <div className="row mb-3 g-3">
    <div className={`col-12 col-md-5 col-lg-4 ${style.cardMain}`}>
      <div key={movie._id} className={`card h-100 ${style.card}`}>
        <Image
          src={movie.image}
          width={200}
          height={400}
          className={`card-img-top ${style.cardImage}`}
          alt={movie.name}
        />
        <div className="card-body">
          <h5 className="card-title">{movie.name}</h5>
          <p className="card-text">Likes: {movie.likes}</p>
          <Likebutton id={movie._id} likes={movie.likes} category="kollywood" />
        </div>
      </div>
    </div>

    <div className="col-12 col-md-7 col-lg-8">
      <div className="ratio ratio-21x9">
        <iframe
          src="https://www.youtube.com/embed/qeVfT2iLiu0?si=YGm23Y831qi3upt-" 
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  </div>

  {/* Description */}
  <div className="row mb-3">
    <div className="col">
      <b>Description:</b> {movie.description}
    </div>
  </div>

  {/* Box Office Day-wise */}
  <div className="row mb-4">
    <div className="col-12 col-md-6">
      <h4>Box Office Collection:</h4>
      <div className="table-responsive">
        <table className="table table-bordered table-striped table-hover table-sm">
          <thead>
            <tr>
              <th>Day</th>
              <th>World Wide Earning</th>
            </tr>
          </thead>
          <tbody>
            {movie.day.map((dayValue, idx) => (
              <tr key={idx}>
                <td>Day {idx + 1}</td>
                <td>{dayValue}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <strong>Total: {totalB}cr</strong>
    </div>
  </div>

</div>

  )
}
