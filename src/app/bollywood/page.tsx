import React from "react";
import Image from "next/image";
import Link from "next/link";
import style from "@/styles/componenet/bollywood/bollywood.module.css"
import { Metadata } from "next";

interface Bolly {
  _id: string;
  name: string;
  release: string;
  image: string;
  likes: number;
  day: number[];
  description: string;
}

interface ApiResponse {
  result: Bolly[];
}

export const metadata: Metadata = {
  title: "Bollywood Movies",
  description:
    "Explore the latest Bollywood movies with posters, release dates, and likes on Vibe Shared. Stay updated with Tamil cinema at your fingertips.",
  openGraph: {
    title: "Bollywood Movies ",
    description:
      "Browse Bollywood movies with details, posters, and ratings on Vibe Shared. Stay up-to-date with Tamil cinema releases.",
    url: "https://vibeshared.com/bollywood",
    siteName: "Vibe Shared",
    images: [
      {
        url: "https://vibeshared.com/icons/og-image.png", // replace with your actual banner/poster
        width: 1200,
        height: 630,
        alt: "Bollywood Movies on Vibe Shared",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bollywood Movies ",
    description:
      "Discover Bollywood movies, posters, and release updates on Vibe Shared.",
    images: ["https://vibeshared.com/icons/og-image.png"],
  },
};

const fetchBollywood = async (): Promise<ApiResponse> => {
  const res = await fetch("http://localhost:3000/api/bollywood");
  if (!res.ok) throw new Error("Failed to fetch Bollywood data");
  return res.json();
};

export default async function Bollywood() {
  const data = await fetchBollywood();
  const movies = data.result;

  return (
    <>
      <div className={`container ${style.container}`}>
        <div className={`row gap-3 mt-5  ${style.row}`}>
          <div className={`col mt-5 ${style.col}`}>
            <h1>Bollywood Movies</h1>
          </div>
        </div>

        <div className={`row row-cols-md-4  row-cols-sm-4  row-cols-2 mt-3 ${style.row}`}>


          {
            movies.map((item)=>{
              return(
                 <div key={item._id} className={`col mb-3 mt-2 `}>
            <div className={`card w-75 ${style.card} `}>
              <Link href={`/bollywood/${item._id}`}
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

