"use client";

import { useEffect, useState } from "react";
import { apiCall } from "../../utils";
import Image from "next/image";
import { LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import NavBar from '@/components/navBar';

interface ArtistProps {
  readonly params: {
    readonly slug: string;
  };
}

export default function Artist({ params }: ArtistProps) {
  const [artist, setArtist] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { isLogin, handleLogout } = useAuth();

  useEffect(() => {
    if (isLogin === false) {
      router.push("/");
    }
  }, [isLogin, router]);
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
      <div className="min-h-screen flex flex-col md:flex-row bg-bgGrey">
        {!isLoading && <NavBar handleLogout={handleLogout} />}
        <div className="flex flex-grow flex-col h-screen w-screen items-center pt-[15vh] md:pt-20 md:ml-[15vh] overflow-y-auto">
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
