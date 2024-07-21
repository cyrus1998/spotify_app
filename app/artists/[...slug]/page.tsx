"use client";

import { useEffect, useRef, useState } from "react";
import { apiCall } from "../../utils";
import Image from "next/image";
import { Newspaper, MicVocal, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoaderIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Artist({ params }: { params: { slug: string } }) {
  const [artist, setArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setIsLoading(true);
    const fetchData = async () => {
      try {
        const response = await apiCall(
          `${process.env.NEXT_PUBLIC_SPOTIFY_API_HOST}v1/artists/${params.slug}`
        );
        setArtist(response);
      } catch (error) {
        console.error("Error fetching artist:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [params.slug]);

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
              <div className="flex w-full aspect-[2/1] border-l-4 border-l-green mb-[4vh]">
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
                  className="flex-col flex-1 h-full hover:bg-bgGrey items-center"
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
          <div className="flex w-4/5 justify-between"></div>

          <div className="flex flex-col mt-16 h-screen w-3/5 gap-x-4 gap-y-8 items-center justify-center">
            {isLoading && (
              <div className="flex items-center justify-center w-full h-full">
                <LoaderIcon className="animate-spin w-[15vh] h-[15vh]" />
              </div>
            )}
            {!isLoading && artist && (
              <div
                key={artist?.name}
                className="flex flex-col scroll-y-overflow mb-80"
              >
                <div className="flex flex-col items-center gap-y-10">
                  <div className="rounded-full relative w-[300px] h-[300px] overflow-hidden">
                    <Image
                      src={artist?.images[1]?.url}
                      alt={artist?.name}
                      width={300}
                      height={300}
                      style={{
                        objectFit: "cover",
                        height: "300px",
                        width: "300px",
                      }}
                    />
                  </div>
                  <strong className="self-center font-black text-6xl">
                    {artist?.name}
                  </strong>
                </div>
                <div className="flex justify-between mt-14 gap-x-8">
                  <div className="flex flex-col items-center">
                    <strong className="text-2xl text-sky-600">
                      {artist?.followers.total}
                    </strong>
                    <strong className="text-sm text-grey">FOLLOWERS</strong>
                  </div>
                  <div className="flex flex-col items-center">
                    {artist?.genres.map((genre: string) => {
                      return (
                        <strong key={genre} className="text-xl text-sky-600">
                          {genre}
                        </strong>
                      );
                    })}
                    <strong className="text-sm text-grey mt-2">GENRES</strong>
                  </div>
                  <div className="flex flex-col items-center">
                    <strong className="text-2xl text-sky-600">
                      {artist?.popularity.toString() + "%"}
                    </strong>
                    <strong className="text-sm text-grey">POPULARITY</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
