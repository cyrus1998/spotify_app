"use client";

import { useEffect, useRef, useState } from "react";
import { apiCall } from "../utils";
import Image from "next/image";
import { Newspaper, MicVocal, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { Play } from "lucide-react";

interface Track {
  id: string;
  name: string;
  preview_url: string;
  album: {
    images: { url: string }[];
  };
  artists: { name: string }[];
  duration_ms: number;
}

interface TopTracksProps {
  topTracks: { items: Track[] };
  isLoading: boolean;
}

export default function Artists() {
  const [topTracks, setTopTracks] = useState<any>({});
  const [timeRange, setTimeRange] = useState<string>("short_term");
  const [isLoading, setIsLoading] = useState(true);
  const [currentTrack, setCurrentTrack] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(
    null
  ) as React.MutableRefObject<HTMLAudioElement | null>;
  const router = useRouter();
  const handlePlayPause = (previewUrl: string, trackId: string) => {
    if (audioRef.current) {
      //not null
      if (currentTrack === trackId) {
        //pause when same track is clicked
        audioRef.current.pause();
        setCurrentTrack(null);
      } else {
        //pause the playing track and play the clicked track
        audioRef.current.pause();
        audioRef.current = new Audio(previewUrl);
        audioRef.current.volume = 0.05;
        audioRef.current.play();
        setCurrentTrack(trackId);
      }
    } else {
      //play the clicked track
      audioRef.current = new Audio(previewUrl);
      audioRef.current.volume = 0.05;
      audioRef.current.play();
      setCurrentTrack(trackId);
    }

    audioRef.current.onended = () => setCurrentTrack(null); //clear the state when the track is over
  };
  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await apiCall(
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
                  onClick={() => router.push("/")}
                >
                  <Newspaper />
                  <p className="text-grey">Profile</p>
                </Button>
              </div>
              <div className="flex w-full aspect-[2/1] mb-[4vh]">
                <Button
                  variant="ghost"
                  className="flex-col flex-1 h-full hover:bg-bgGrey items-center"
                  onClick={() => router.push("/artists")}
                >
                  <MicVocal />
                  <p className="text-grey">Top Artists</p>
                </Button>
              </div>
              <div className="flex w-full aspect-[2/1]">
                <Button
                  variant="ghost"
                  className="flex-col flex-1 h-full hover:bg-bgGrey border-l-4 border-l-green items-center"
                  onClick={() => router.push("/tracks")}
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
            <strong className="text-3xl">Top Tracks</strong>
            <div className="flex w-1/4 justify-between items-end">
              <strong
                className={
                  (timeRange === "long_term"
                    ? "underline"
                    : "text-grey hover:text-white") + " 2xl cursor-pointer"
                }
                onClick={() => setTimeRange("long_term")}
              >
                All Time
              </strong>
              <strong
                className={
                  (timeRange === "medium_term"
                    ? "underline"
                    : "text-grey hover:text-white") + " 2xl cursor-pointer"
                }
                onClick={() => setTimeRange("medium_term")}
              >
                6 Months
              </strong>
              <strong
                className={
                  (timeRange === "short_term"
                    ? "underline"
                    : "text-grey hover:text-white") + " 2xl cursor-pointer"
                }
                onClick={() => setTimeRange("short_term")}
              >
                4 Weeks
              </strong>
            </div>
          </div>

          <div className="flex flex-col justify-between mt-16 h-screen w-3/5 gap-x-4 gap-y-8">
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <LoaderIcon className="animate-spin w-[15vh] h-[15vh]" />
              </div>
            )}

            {!isLoading &&
              topTracks.items.map((item) => {
                return (
                  <div
                    key={item.name}
                    className="flex gap-y-2 scroll-y-overflow justify-between"
                  >
                    <div className="flex gap-x-4">
                      <div
                        className="relative h-50 w-50 overflow-hidden"
                        onClick={() =>
                          handlePlayPause(item.preview_url, item.id)
                        }
                      >
                        <Image
                          src={
                            item.album?.images[2].url
                              ? item.album.images[2]?.url
                              : ""
                          }
                          alt={item.name}
                          width={50}
                          height={50}
                          style={{
                            objectFit: "cover",
                            height: "50px",
                            width: "50px",
                          }}
                        />
                        {/* <div className="absolute inset-0 bg-black opacity-50"></div> */}
                        <div className="absolute inset-0 overflow-hidden bg-fixed bg-black opacity-0 transition duration-300 ease-in-out hover:opacity-50 hover:cursor-pointer">
                          <div className="h-full w-full flex justify-center items-center">
                            <Play />
                          </div>
                        </div>
                      </div>
                      <div className="flex-col">
                        <p className="font-bold">{item.name}</p>
                        <p className="text-grey">
                          {item.artists[0].name + " · " + item.name}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p>
                        {Math.floor(item.duration_ms / 1000 / 60).toString() +
                          ":" +
                          (Math.floor((item.duration_ms / 1000) % 60).toString()
                            .length === 1
                            ? "0" +
                              Math.floor(
                                (item.duration_ms / 1000) % 60
                              ).toString()
                            : Math.floor(
                                (item.duration_ms / 1000) % 60
                              ).toString())}
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
