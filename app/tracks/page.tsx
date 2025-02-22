"use client";

import { useEffect, useRef, useState } from "react";
import { apiCall } from "../utils";
import Image from "next/image";
import { LoaderIcon, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from '@/components/navBar';

interface Track {
  id: string;
  name: string;
  preview_url: string;
  album: {
    images: { url: string }[];
    external_urls: { spotify: string };
  };
  artists: { name: string }[];
  duration_ms: number;
}

interface TopTracksResponse {
  items: Track[];
}

export default function Tracks() {
  const [topTracks, setTopTracks] = useState<TopTracksResponse>({ items: [] });
  const [timeRange, setTimeRange] = useState<string>("short_term");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const router = useRouter();
  const { isLogin, handleLogout } = useAuth();

  useEffect(() => {
    if (isLogin === false) {
      router.push("/");
    }
  }, [isLogin, router]);

  const handlePlayPause = (spotifyUrl: string) => {
    window.open(spotifyUrl, '_blank');
  };

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response: TopTracksResponse = await apiCall(
          `${process.env.NEXT_PUBLIC_SPOTIFY_API_HOST}v1/me/top/tracks?time_range=${timeRange}&limit=30`
        );
        setTopTracks(response);
      } catch (error) {
        console.error("Error fetching top tracks:", error);
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
            <strong className="text-3xl">Top Tracks</strong>
            <div className="flex w-full md:w-1/4 justify-between items-end">
              <Button
                variant="ghost"
                className={(timeRange === "long_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={() => setTimeRange("long_term")}>
                All Time
              </Button>
              <Button
                variant="ghost"
                className={(timeRange === "medium_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={() => setTimeRange("medium_term")}>
                6 Months
              </Button>
              <Button
                variant="ghost"
                className={(timeRange === "short_term" ? "underline" : "text-grey hover:text-white") + " 2xl"}
                onClick={() => setTimeRange("short_term")}>
                4 Weeks
              </Button>
            </div>
          </div>

          <div className="flex flex-col justify-between mt-8 md:mt-16 h-screen w-[90%] md:w-3/5 gap-x-4 gap-y-8">
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <LoaderIcon className="animate-spin w-[15vh] h-[15vh]" />
              </div>
            )}

            {!isLoading &&
              topTracks.items.map((item: Track) => {
                return (
                  <div
                    key={item.name}
                    className="flex gap-y-2 scroll-y-overflow justify-between"
                  >
                    <div className="flex gap-x-4">
                      <button
                        className="relative h-50 w-50 overflow-hidden border-0 bg-transparent p-0"
                        onClick={() => handlePlayPause(item.album?.external_urls.spotify)}
                        aria-label={`Play ${item.name}`}
                      >
                        <Image
                          src={item.album?.images[2]?.url || ""}
                          alt={item.name}
                          width={50}
                          height={50}
                          style={{
                            objectFit: "cover",
                            height: "50px",
                            width: "50px",
                          }}
                        />
                        <div className="absolute inset-0 overflow-hidden bg-fixed bg-black opacity-0 transition duration-300 ease-in-out hover:opacity-50 hover:cursor-pointer">
                          <div className="h-full w-full flex justify-center items-center">
                            <Play />
                          </div>
                        </div>
                      </button>
                      <div className="flex-col">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-grey">
                          {item.artists[0]?.name + " · " + item.name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p>
                        {Math.floor(item.duration_ms / 1000 / 60).toString() +
                          ":" +
                          (Math.floor((item.duration_ms / 1000) % 60).toString()
                            .padStart(2, '0'))}
                      </p>
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
