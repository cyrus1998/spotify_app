"use client";

import { useEffect, useState } from "react";
import { apiCall } from "../utils";
import Image from "next/image";
import { Newspaper, MicVocal, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { useRouter } from 'next/navigation'

interface ExternalUrls {
  spotify: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

interface TopArtist {
  external_urls: ExternalUrls;
  href: string;
  id: string;
  name: string;
  type: string;
  uri: string;
  images: Image[];
}

interface TopArtistsResponse {
  items: TopArtist[];
}

export default function Artists() {
  const [topArtists, setTopArtists] = useState<TopArtistsResponse>({ items: [] });
  const [timeRange, setTimeRange] = useState<string>("short_term");
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
    // const fetchData = setTopArtists(() => apiCall(process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + `v1/me/top/artists?time_range=${timeRange}&limit=50`))
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await apiCall(
          `${process.env.NEXT_PUBLIC_SPOTIFY_API_HOST}v1/me/top/artists?time_range=${timeRange}&limit=30`
        );
        setTopArtists(response);
      } catch (error) {
        console.error("Error fetching top artists:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [timeRange]);

  return (
    <main>
      <div className="min-h-screen flex flex-row bg-bgGrey">
        {!isLoading && (
          <div>
            <div className="flex flex-col flex-none h-screen min-w-[15vh] bg-background justify-center items-center fixed top-0">
              <div className="absolute top-0 mt-[4vh]">
                <Image
                  src="/img/Spotify_Logo_RGB_White.png"
                  alt="spotify_white_logo"
                  width={236}
                  height={70}
                  style={{ width: "auto", height: "auto" }}
                />
              </div>
              <div className="flex w-full aspect-[2/1] mb-[4vh]">
                <Button
                  variant="ghost"
                  className="flex-col flex-1 h-full hover:bg-bgGrey items-center"
                  onClick={()=>router.push('/')}
                >
                  <Newspaper />
                  <p className="text-grey">Profile</p>
                </Button>
              </div>
              <div className="flex w-full aspect-[2/1] border-l-4 border-l-green mb-[4vh]">
                <Button
                  variant="ghost"
                  className="flex-col flex-1 h-full hover:bg-bgGrey items-center"
                  onClick={()=>router.push('/artists')}
                >
                  <MicVocal />
                  <p className="text-grey">Top Artists</p>
                </Button>
              </div>
              <div className="flex w-full aspect-[2/1]">
                <Button
                  variant="ghost"
                  className="flex-col flex-1 h-full hover:bg-bgGrey items-center"
                  onClick={()=>router.push('/tracks')}
                >
                  <Headphones />
                  <p className="text-grey">Top Tracks</p>
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="flex flex-grow flex-col h-screen w-screen items-center pt-20 overflow-y-auto">
          <div className="flex w-4/5 justify-between">
            <strong className="text-3xl">Top artists</strong>
            <div className="flex w-1/4 justify-between items-end">
              <strong
              className={(timeRange==="long_term" ? "underline" : "text-grey hover:text-white") + " 2xl cursor-pointer"}
              onClick={()=>setTimeRange('long_term')
              }>
                All Time
              </strong>  
              <strong className={(timeRange==="medium_term" ? "underline" : "text-grey hover:text-white") + " 2xl cursor-pointer"}
              onClick={()=>setTimeRange('medium_term')}
              >
              6 Months
              </strong>
              <strong className={(timeRange==="short_term" ? "underline" : "text-grey hover:text-white") + " 2xl cursor-pointer"}
              onClick={()=>setTimeRange('short_term')}
              >
              4 Weeks
              </strong>
            </div>
          </div>

          <div className="flex justify-between flex-wrap mt-16 h-screen w-3/5 gap-x-4 gap-y-8">
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <LoaderIcon className="animate-spin w-[15vh] h-[15vh]" />
              </div>
            )}

            {!isLoading &&
              topArtists.items.map((item:TopArtist) => {
                return (
                  <div key={item.name} className="flex flex-col gap-y-2 scroll-y-overflow justify-start">
                    <div className="flex flex-col gap-y-2">
                    <div className="rounded-full h-50 w-50 overflow-hidden hover:cursor-pointer">
                      <Image
                        src={item.images[2].url || ""}
                        alt={item.name}
                        width={200}
                        height={200}
                        style={{
                          objectFit: "cover",
                          height: "200px",
                          width: "200px",
                        }}
                        onClick={()=>{router.push('/artists/' + item.id)}}
                      />
                    </div>
                    <strong className="self-center mb-1">{item.name}</strong>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </main>
  );
}
