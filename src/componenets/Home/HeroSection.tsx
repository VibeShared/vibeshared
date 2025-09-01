import React from "react";
import Image from "next/image";
import style from '@/styles/componenet/Home/HeroSction.module.css'
import Likebutton from "./Likebutton";
import Link from "next/link";

interface Bolly {
  _id: string;
  name: string;
  release: string;
  image: string;
  likes: number;
  day: string[];
  description: string;
}

interface ApiResponse {
  result: Bolly[];
}

const fetchBollywood = async (): Promise<ApiResponse> => {
  const res = await fetch("http://localhost:3000/api/bollywood");
  if (!res.ok) throw new Error("Failed to fetch Bollywood data");
  return res.json();
};

const fetchKollywood = async (): Promise<ApiResponse> => {
  const res = await fetch("http://localhost:3000/api/kollywood");
  if (!res.ok) throw new Error("Failed to fetch Kollywood data");
  return res.json();
};

export default async function HeroSection() {
  const data = await fetchBollywood();
  const data2 = await fetchKollywood();

  const Kollywood = data2.result;
  const movies = data.result;

  const totalBol = movies?.reduce((sum, movie) => {
    return sum + movie.day.reduce((s, val) => s + parseFloat(val), 0);
  }, 0);

  const totalKol = Kollywood?.reduce((sum, movie) => {
    return sum + movie.day.reduce((s, val) => s + parseFloat(val), 0);
  }, 0);

  return (
    <div className={`container  ${style.main}`}>

      {/* Winner Row */}
      <div className={`row ${style.row}`}>
        <div className={`col-6 m-auto ${style.kingcol}`}>
          {totalBol > totalKol ? (
            <Image src="/King.png" className={style.king}  fill alt="king" />
          ) : (
            <h3>Looser</h3>
          )}
        </div>
        <div className={`col-6 m-auto ${style.kingcol}`}>
          {totalKol > totalBol ? (
            <Image src="/King.png" className={`${style.king}`} fill alt="king" />
          ) : (
            <h3>Looser</h3>
          )}
        </div>
      </div>

      {/* Header */}
      <div className={`row ${style.head}`}>
        <div className={`col-6  ${style.col}`}><h3>Bollywood</h3></div>
       
        <div className={`col-6 ${style.col}`}><h3>Kollywood</h3></div>
      </div>

      {/* Movies List */}
      
        <div className={`container ${style.cardcontainers}`}>
          <div className={`row  justify-content-around ${style.card} mb-3`}>
          {movies.map((item) => (
          <div  key={item._id} className={`col-6 ${style.card1}`}>
            <div className="card w-100">
             <Link href={`/bollywood/${item._id}`}>
              <Image
                src={item.image}
               width={300} height={400}
                className={`card-img-top ${style.img}`}
                alt={item.name}
              /></Link>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Total Collection: <strong>{totalBol} cr </strong> </p>
                <Likebutton id={item._id} likes={item.likes} category="bollywood" />
              </div>
            </div>
          </div>
           ))}

          

          {Kollywood.map((item) => (
          <div  key={item._id} className={`col-6 ${style.card2}`}>
            <div className="card w-100">
              <Link href={`/kollywood/${item._id}`}>
              <Image
                src={item.image}
               width={230} height={400}
                className={`card-img-top  ${style.img}`}
                alt={item.name}
              /></Link>
              <div className="card-body">
                <h5 className="card-title">{item.name}</h5>
                <p className="card-text">Total Collection: <strong>{totalKol} cr </strong>  </p>
                <Likebutton id={item._id} likes={item.likes} category="kollywood" />
              </div>
            </div>
          </div>
           ))}
        </div>
        </div>

    </div>
  );
}
