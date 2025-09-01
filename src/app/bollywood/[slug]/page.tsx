import React from 'react'
import style from "@/styles/componenet/bollywood/slug.module.css"
import Image from 'next/image'
import Likebutton from '@/componenets/Home/Likebutton'
import { Metadata } from 'next'

interface Bolly {
  _id: string;
  name: string;
  release: string;
  image: string;
  likes: number;
  day: string[];
  description: string;
  likedBy: string[];
  
}









export default async function Page({ params } : any) {
  interface ApiResponse {
    result: Bolly;
  }

  const { slug } = await  params;

  const fetchBollywood = async (): Promise<ApiResponse> => {
    const res = await fetch(`http://localhost:3000/api/bollywood/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to fetch Bollywood data");
    }

    return res.json();
  };

  const data = await fetchBollywood();
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
          width={300}
          height={400}
          className="card-img-top"
          alt={movie.name}
        />
        <div className="card-body">
          <h5 className="card-title">{movie.name}</h5>
          <p className="card-text">Likes: {movie.likes}</p>
          <Likebutton id={movie._id} likes={movie.likes} category="bollywood" />
        </div>
      </div>
    </div>

    <div className="col-12 col-md-7 col-lg-8">
      <div className="ratio ratio-21x9">
        <iframe
          src="https://www.youtube.com/embed/mjBym9uKth4?si=k96xsPac0aHT9n1R"
          title="YouTube video player"
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
              <th>Wolrd Wide Earning</th>
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
