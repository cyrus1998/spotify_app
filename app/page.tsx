"use client";
import { Button } from "@/components/ui/button";
import { createHash } from "crypto";
import querystring from "querystring";
import { useEffect, useState } from "react";
import { apiCall,refreshCall } from "./utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { Newspaper } from 'lucide-react';
import { MicVocal } from 'lucide-react';
import { Headphones } from 'lucide-react';
import { Router, useRouter } from 'next/navigation'

export default function Home() {
  interface imageBody {
    url: string;
    height: number;
    width: number;
  }

  interface Userdataresponse {
    country?: string;
    display_name?: string;
    email?: string;
    id?: string;
    images?: imageBody[];
    uri?: string;
  }


  const [isLogin, setIsLogin] = useState(false);
  const [userData, setUserData] = useState<Userdataresponse>({});
  const [playLists, setPlayLists] = useState(0);
  const [following, setFollowing] = useState(0);
  const { theme, setTheme } = useTheme();
  const [topArtists, setTopArtists] = useState<any>({});
  const [topTracks, setTopTracks] = useState<any>({});
  const router = useRouter()
  const generateRandomString = (length: number): string => {
    const possible =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values)
      .map((x) => possible[x % possible.length])
      .join("");
  };

  const sha256 = async (plain: string): Promise<string> => {
    const hash = createHash("sha256");
    hash.update(plain);
    return hash.digest("hex");
  };

  const base64encode = (input: Uint8Array): string => {
    return btoa(String.fromCharCode(...Array.from(input)))
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");
  };

  const getToken = async (code: string) => {
    // stored in the previous step
    console.log("getToken is called");
    let codeVerifier = localStorage.getItem("code_verifier");
    const params = new URLSearchParams();
    params.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID ?? "");
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", process.env.NEXT_PUBLIC_HOST ?? "");
    params.append("code_verifier", codeVerifier ?? "");

    const payload = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    };
    let url = "https://accounts.spotify.com" + "/api/token";
    const body = await fetch(url, payload);
    const response = await body.json();
    if (body.status === 200) {
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem("expire",response.expires_in * 1000 + Date.now());
    }else{
      window.location.replace(process.env.NEXT_PUBLIC_HOST)
    }
  };

  const loginHandler = async () => {
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("code_verifier");
      localStorage.removeItem("expire");
      const codeVerifier: string = generateRandomString(64);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(Buffer.from(hashed, "hex"));
      const scope = "user-read-private user-read-email user-follow-read user-top-read";
      window.localStorage.setItem("code_verifier", codeVerifier);
      const redirectUri =
        "https://accounts.spotify.com/authorize?" +
        querystring.stringify({
          response_type: "code",
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.NEXT_PUBLIC_HOST,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
        });
      window.location.replace(redirectUri);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get("code");
    let accessToken = localStorage.getItem("access_token");
    let refresh_token = localStorage.getItem("refresh_token");
    let expire = localStorage.getItem("expire");
    console.log(
      "the token",
      accessToken,
      typeof accessToken,
      isLogin,
      code,
      accessToken == null || accessToken == "undefined",
      refresh_token,
      (refresh_token == null || refresh_token == undefined), 
      (Date.now() > Number(expire) || isNaN(expire))
    );
    if (!isLogin && code) {
      if (accessToken == null || accessToken == "undefined") {
        console.log("function should trigger");
        getToken(code); //first login
      }
      setIsLogin(true); //refresh on page
    }else if(!isLogin && refresh_token){
      refreshCall();
      setIsLogin(true)
    }
  }, []);

  async function fetchData(endPoint:string,update: (result: any) => void, field:string) {
    try {
      const result = await apiCall(
        process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + endPoint
      );
      // Handle the resolved data here
      if (field !== ""){
        update(result[field])
      }else{
        update(result);
      }
    } catch (error) {
      // Handle any errors that occurred during the API call
      console.log(error);
    }
  }
  
  async function fetchFollowingData(endPoint:string) {
    try {
      const result = await apiCall(
        process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + endPoint
      );
      setFollowing(result.artists.total)
    } catch (error) {
      // Handle any errors that occurred during the API call
      console.log(error);
    }
  }

  useEffect(() => {
    if (isLogin) {
      fetchData("v1/me",setUserData,""); //main profile data
      fetchData("v1/me/top/artists?time_range=long_term&limit=5",setTopArtists,""); //main profile data
      fetchData("v1/me/top/tracks?time_range=long_term&limit=5",setTopTracks,""); //main profile data
    }
  }, [isLogin]);
  
  useEffect(()=>{
    if(Object.keys(userData).length>0){
      fetchData("v1/users/"+ userData.id +"/playlists",setPlayLists,"total"); //playlist data
      fetchFollowingData("v1/me/following?type=artist"); 
    }
  }, [userData])


  return (
    <main>
      <div className="min-h-screen flex items-center justify-center bg-bgGrey">
        {isLogin&&
        <div className="flex flex-col flex-none min-h-screen min-w-[15vh] bg-background justify-center items-center">
        <div className="flex w-full aspect-[2/1] border-l-4 border-l-green mb-[4vh]">
        <Button variant="ghost" className="flex-col flex-1 h-full hover:bg-bgGrey items-center">
          <Newspaper />
          <p className="text-grey">Profile</p>
        </Button>
        </div>
        <div className="flex w-full aspect-[2/1] mb-[4vh]">
        <Button variant="ghost" className="flex-col flex-1 h-full hover:bg-bgGrey items-center">
          <MicVocal />
          <p className="text-grey">Top Artists</p>
        </Button>
        </div>
        <div className="flex w-full aspect-[2/1]">
        <Button variant="ghost" className="flex-col flex-1 h-full hover:bg-bgGrey items-center">
          <Headphones />
          <p className="text-grey">Top Tracks</p>
        </Button>
        </div>
      </div>
        }
        {!isLogin && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <strong className="text-3xl">Spotify Profile</strong>
            <Button size="lg" onClick={() => loginHandler()}>
              Login
            </Button>
          </div>
        )}
        {isLogin && Object.keys(userData).length>0 && Object.keys(topArtists).length>0 && Object.keys(topTracks).length>0&&(
          <div className="flex flex-grow flex-col min-h-screen min-w-screen items-center">
            <div
              className={
                "flex flex-col h-[30vh] w-4/5 items-center mt-8"
              }
            >
              <div className="flex flex-row items-center justify-between w-[22.5vh]">
              <div className="rounded-full h-16 w-16 overflow-hidden">
              <Image
              src={userData.images[1].url}
              alt="User Icon"   
              width={64}
              height={64}
              objectFit="cover"
              priority={true}
              />
              </div>
              <strong>{userData.display_name}</strong>
              </div>
              
              <div className="flex flex-row justify-between w-3/5 mt-4">
              <div className="flex flex-col items-center">
              <p className="text-grey">Following</p>
              <strong className="text-2xl mt-4 text-green">{following}</strong>
              </div>
              <div className="flex flex-col items-center">
              <p className="text-grey">Followers</p>
              <strong className="text-2xl mt-4 text-green">{userData.followers.total}</strong>
              </div>
              <div className="flex flex-col items-center">
              <p className="text-grey">Playlist</p>
              <strong className="text-2xl mt-4 text-green">{playLists}</strong>
              </div>
              </div>

            </div>
            <div className={"flex h-[50vh] w-full justify-center items-center"}>
              <div className={"flex flex-col flex-1 h-full w-1/2"}>
                <div className="flex place-content-start items-center">
                  <strong className="ml-10">Top Artists of All Time</strong>
                  <Button
                  className="ml-20" 
                  variant="ghost"
                  onClick={()=>{
                    console.log("clicked")
                    router.push('/artists')
                  }}
                  >
                  More...
                  </Button>
                </div> 
              <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topArtists.items[0].images[1].url}
                  alt="Top Arist Icon 1"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topArtists.items[0].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topArtists.items[1].images[1].url}
                  alt="Top Arist Icon 2"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topArtists.items[1].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topArtists.items[2].images[1].url}
                  alt="Top Arist Icon 3"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topArtists.items[2].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
                <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topArtists.items[3].images[1].url}
                  alt="Top Arist Icon 4"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topArtists.items[3].name}</p>
                </div>
              </div>
              <div className={"flex flex-col flex-1 h-full w-1/2"}>
              <div className="flex place-content-start items-center">
                  <strong className="ml-10">Top Tracks of All Time</strong>
                  <Button className="ml-20" variant="ghost">More...</Button>
                </div> 
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topTracks.items[0].album.images[1].url}
                  alt="Top track Icon 1"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topTracks.items[0].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topTracks.items[1].album.images[1].url}
                  alt="Top track Icon 2"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topTracks.items[1].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topTracks.items[2].album.images[1].url}
                  alt="Top track Icon 3"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topTracks.items[2].name}</p>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
              <div className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10">
                  <Image
                  src={topTracks.items[3].album.images[1].url}
                  alt="Top track Icon 4"   
                  width={64}
                  height={64}
                  objectFit="cover"
                  priority={true}
                  />
              </div>
              <p>{topTracks.items[3].name}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

