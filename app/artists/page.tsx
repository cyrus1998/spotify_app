"use client";

import { useEffect, useState } from "react";
import { apiCall } from "../utils";
import Image from "next/image";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation'
import { useAuth } from "@/contexts/AuthContext";
import NavBar from '@/components/navBar';

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
  const { isLogin, handleLogout } = useAuth();

  useEffect(() => {
    if (isLogin === false) {
      router.push("/");
    }
  }, [isLogin, router]);

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
      <div className="min-h-screen flex flex-col md:flex-row bg-bgGrey">
        {!isLoading && <NavBar handleLogout={handleLogout} />}
        <div className="flex flex-grow flex-col h-screen w-screen items-center pt-[15vh] md:pt-20 md:ml-[15vh] overflow-y-auto">
          <div className="flex w-[90%] md:w-4/5 flex-col md:flex-row gap-y-4 md:gap-y-0 justify-between">
            <strong className="text-3xl">Top artists</strong>
            <div className="flex w-full md:w-1/4 justify-between items-end">
              <Button 
                variant="ghost"
                className={(timeRange==="long_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={()=>setTimeRange('long_term')}>
                All Time
              </Button>  
              <Button 
                variant="ghost"
                className={(timeRange==="medium_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={()=>setTimeRange('medium_term')}>
                6 Months
              </Button>
              <Button 
                variant="ghost"
                className={(timeRange==="short_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={()=>setTimeRange('short_term')}>
                4 Weeks
              </Button>
            </div>
          </div>

          <div className="flex justify-between flex-wrap mt-8 md:mt-16 h-screen w-[90%] md:w-3/5 gap-x-4 gap-y-8">
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
                      <button
                        className="rounded-full h-50 w-50 overflow-hidden hover:cursor-pointer border-0 bg-transparent p-0"
                        onClick={() => router.push('/artists/' + item.id)}
                        aria-label={`View ${item.name}'s details`}
                      >
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
                        />
                      </button>
                      <button
                        className="border-0 bg-transparent p-0 hover:underline"
                        onClick={() => router.push('/artists/' + item.id)}
                      >
                        <strong className="self-center mb-1">{item.name}</strong>
                      </button>
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
