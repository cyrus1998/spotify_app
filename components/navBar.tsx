"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Newspaper, MicVocal, Headphones, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface NavBarProps {
  handleLogout: () => void;
}

export default function NavBar({ handleLogout }: NavBarProps) {
  const router = useRouter();

  return (
    <div className="flex flex-row md:flex-col flex-none h-[10vh] md:h-screen w-screen md:w-[15vh] bg-background fixed top-0 md:left-0">
      <div className="hidden md:block absolute top-0 mt-[4vh]">
        <Image
          src="/img/Spotify_Logo_RGB_White.png"
          alt="spotify_white_logo"
          width={118}
          height={70} 
          style={{ width: 'auto', height: 'auto' }} 
        />
      </div>
      <div className="flex flex-row md:flex-col w-full h-full">
        <div className="flex flex-row md:flex-col items-center justify-center flex-1 gap-8 md:mt-[20vh]">
          <Button 
            variant="ghost" 
            className="flex-col items-center w-[64px] h-[64px] hover:bg-bgGrey"
            onClick={() => router.push('/')}
          >
            <Newspaper size={24} />
            <p className="text-grey hidden md:block">Profile</p>
          </Button>

          <Button 
            variant="ghost" 
            className="flex-col items-center w-[64px] h-[64px] hover:bg-bgGrey"
            onClick={() => router.push('/artists')}
          >
            <MicVocal size={24} />
            <p className="text-grey hidden md:block">Top Artists</p>
          </Button>

          <Button 
            variant="ghost" 
            className="flex-col items-center w-[64px] h-[64px] hover:bg-bgGrey"
            onClick={() => router.push('/tracks')}
          >
            <Headphones size={24} />
            <p className="text-grey hidden md:block">Top Tracks</p>
          </Button>
        </div>
        <div className="flex md:absolute md:bottom-8 md:w-full justify-center">
          <Button
            variant="ghost"
            className="flex-col items-center w-[64px] h-[64px] hover:bg-bgGrey text-red-500"
            onClick={handleLogout}
          >
            <LogOut size={24} />
            <p className="hidden md:block">Logout</p>
          </Button>
        </div>
      </div>
    </div>
  );
}