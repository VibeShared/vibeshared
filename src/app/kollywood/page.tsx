import React from "react";
import Image from "next/image";
import Link from "next/link";
import style from "@/styles/componenet/bollywood/bollywood.module.css"
import type { Metadata } from "next";

interface Kolly {
  _id: string;
  name: string;
  release: string;
  image: string;
  likes: number;
  day: number[];
  description: string;
}

interface ApiResponse {
  result: Kolly[];
}


export const metadata: Metadata = {
  title: "Kollywood Movies",
  description:
    "Explore the latest Kollywood movies with posters, release dates, and likes on Vibe Shared. Stay updated with Tamil cinema at your fingertips.",
  openGraph: {
    title: "Kollywood Movies ",
    description:
      "Browse Kollywood movies with details, posters, and ratings on Vibe Shared. Stay up-to-date with Tamil cinema releases.",
    url: "https://vibeshared.com/kollywood",
    siteName: "Vibe Shared",
    images: [
      {
        url: "https://vibeshared.com/icons/og-image.png", // replace with your actual banner/poster
        width: 1200,
        height: 630,
        alt: "Kollywood Movies on Vibe Shared",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kollywood Movies ",
    description:
      "Discover Kollywood movies, posters, and release updates on Vibe Shared.",
    images: ["https://vibeshared.com/icons/og-image.png"],
  },
};

const fetchKollywood = async (): Promise<ApiResponse> => {
  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
  const res = await fetch(`http://localhost:3000/api/kollywood`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    cache: 'no-store', // optional for SSR
  });

  if (!res.ok) throw new Error("Failed to fetch Kollywood data");
  return res.json();
};


export default async function Kollywood() {
  const data = await fetchKollywood();
  const movies = data.result;

  return (
    <>
      <div className={`container ${style.container}`}>
        <div className={`row gap-3 mt-5  ${style.row}`}>
          <div className={`col mt-5 ${style.col}`}>
            <h1>Kollywood Movies</h1>
          </div>
        </div>

        <div className={`row row-cols-md-4  row-cols-sm-4  row-cols-2 mt-3 ${style.row}`}>


          {
            movies.map((item)=>{
              return(
                 <div key={item._id} className={`col mb-3 mt-2 `}>
            <div className={`card w-75 ${style.card} `}>
              <Link href={`/kollywood/${item._id}`}
              >
                <Image
                  src={`${item.image}`}
                  width={100} height={300}
                  className={`card-img-top ${style.img}`}
                  alt={`${item.name}`}
                />
              </Link>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
              </div>
            </div>
          </div>
              )
            })
          }



        </div>




      </div>


    </>
  )
}

