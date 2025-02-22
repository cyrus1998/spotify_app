"use client";
import { Button } from "@/components/ui/button";
import { createHash } from "crypto";
import querystring from "querystring";
import { useEffect, useState } from "react";
import { apiCall, refreshCall } from "./utils";
import Image from "next/image";
import { LoaderIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from "@/contexts/AuthContext";
import NavBar from '@/components/navBar';

export default function Home() {
  interface Imagebody {
    url: string;
    height: number;
    width: number;
  }

  interface Followersbody {
    href: string;
    total: number;
  }
  interface Userdataresponse {
    country: string;
    display_name: string;
    email: string;
    id: string;
    images: Imagebody[];
    uri: string;
    followers: Followersbody
  }

  const [isLoading, setIsLoading] = useState(true);
  const {isLogin, setIsLogin, handleLogout} = useAuth();
  const [userData, setUserData] = useState<Userdataresponse>({
    country: "",
    display_name: "",
    email: "",
    id: "",
    images: [],
    uri: "",
    followers: {
      href: "",
      total: 0
    }
  });
  const [playLists, setPlayLists] = useState(0);
  const [following, setFollowing] = useState(0);
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
    // console.log("getToken is called");
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
      localStorage.setItem("expire",(response.expires_in * 1000 + Date.now()).toString());
    }else{
      window.location.replace(process.env.NEXT_PUBLIC_HOST ?? "")
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
      const codeChallenge = base64encode(new Uint8Array(Buffer.from(hashed, "hex")));
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
    const checkLogin = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      let code = urlParams.get("code");
      let accessToken = localStorage.getItem("access_token");
      let refresh_token = localStorage.getItem("refresh_token");
      if(!isLogin){
        if(code){
          if (!accessToken || accessToken === "undefined") {
            await getToken(code); // first login
          }
          setIsLogin(true); // refresh on page
        }
        else if(refresh_token){

          await refreshCall();
          setIsLogin(true);
        }else{
          // console.log("not login but show page")
          setIsLoading(false);
        }
      }
    };
    checkLogin();
  }, [isLogin]);

  async function fetchData(endPoint:string, update: (result: any) => void, field:string) {
    try {
      const result = await apiCall(
        process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + endPoint
      );
      if (field !== "") {
        update(result[field])
      } else {
        update(result);
      }
    } catch (error) {
      if (error instanceof Error && error.message.includes('401')) {
        handleLogout();
      }
      console.error("Error fetching data:", error);
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
      const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(errorMessage);
    }
  }

  useEffect(() => {
    if (isLogin) {
      Promise.all([
        fetchData("v1/me", setUserData, ""),
        fetchData("v1/me/top/artists?time_range=long_term&limit=5", setTopArtists, ""),
        fetchData("v1/me/top/tracks?time_range=long_term&limit=5", setTopTracks, "")
      ]).catch(error => {
        console.error("Error fetching data:", error);
        if (error instanceof Error && error.message.includes('401')) {
          handleLogout();
        }
      });
    } else {
      // Clear state data when logged out
      setUserData({
        country: "",
        display_name: "",
        email: "",
        id: "",
        images: [],
        uri: "",
        followers: {
          href: "",
          total: 0
        }
      });
      setTopArtists({});
      setTopTracks({});
      setPlayLists(0);
      setFollowing(0);
    }
  }, [isLogin, handleLogout]);
  
  useEffect(()=>{
    if(Object.keys(userData).length>0){
      try{
        fetchData("v1/users/"+ userData.id +"/playlists",setPlayLists,"total"); //playlist data
        fetchFollowingData("v1/me/following?type=artist"); 
        // console.log("why can pass to here")
        setIsLoading(false)
      }catch(error){
        //catch error
        console.log("error occurs when fetching userdata",error);
      }
    }
  }, [userData])

  return (
    <main>
      <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-bgGrey overflow-y-scroll">
        {isLoading &&
          <LoaderIcon className="animate-spin w-[5vh] h-[5vh]" />
        }
        {!isLoading && isLogin && Object.keys(userData).length>0 && Object.keys(topArtists).length>0 && Object.keys(topTracks).length>0 &&
          <NavBar handleLogout={handleLogout} />
        }
        {!isLoading && !isLogin && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <strong className="text-3xl">Spotify Profile</strong>
            <Button size="lg" onClick={() => loginHandler()}>
              Login
            </Button>
          </div>
        )}
        {!isLoading && isLogin && Object.keys(userData).length>0 && Object.keys(topArtists).length>0 && Object.keys(topTracks).length>0 &&(
          <div className="flex flex-grow flex-col min-h-screen w-screen items-center pt-[15vh] md:pt-20 md:ml-[15vh]">
            <div
              className={
                "flex flex-col h-[30vh] w-[90%] md:w-2/5 items-center mt-8 md:mt-16 justify-between"
              }
            >
              <div className="flex flex-row items-center justify-between w-[22.5vh]">
              <div className="rounded-full h-150 w-150 overflow-hidden ml-[3vh]">
              <Image
              src={userData.images[1].url}
              alt="User Icon"   
              width={150}
              height={150}
              style={{objectFit:"cover"}}
              priority={true}
              />
              </div>
              </div>
              <strong className="text-3xl">{userData.display_name}</strong>
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
            <div className="flex flex-col md:flex-row h-auto md:h-[50vh] w-[90%] md:w-[4/5] justify-center items-center mt-8 md:mt-16">
              <div className={"flex flex-col flex-1 h-full w-1/2"}>
                <div className="flex place-content-start items-center">
                  <strong className="ml-10">Top Artists of All Time</strong>
                  <Button
                  className="ml-20" 
                  variant="ghost"
                  onClick={()=>{
                    router.push('/artists')
                  }}
                  >
                  More...
                  </Button>
                </div> 
              <div className="flex flex-row w-full mt-4 items-center">
                <button
                  className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                  onClick={() => router.push('/artists/' + topArtists.items[0].id)}
                  aria-label={`View ${topArtists.items[0].name}'s details`}
                >
                  <Image
                  src={topArtists.items[0].images[1].url}
                  alt="Top artists Icon 1"   
                  width={64}
                  height={64}
                  style={{objectFit:"cover"}}
                  priority={true}
                  />
                </button>
                <button
                  className="border-0 bg-transparent p-0 hover:underline"
                  onClick={() => router.push('/artists/' + topArtists.items[0].id)}
                >
                  <p>{topArtists.items[0].name}</p>
                </button>
              </div>
              <div className="flex flex-row w-full mt-4 items-center">
                <button
                  className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                  onClick={() => router.push('/artists/' + topArtists.items[1].id)}
                  aria-label={`View ${topArtists.items[1].name}'s details`}
                >
                  <Image
                  src={topArtists.items[1].images[1].url}
                  alt="Top artists Icon 2"   
                  width={64}
                  height={64}
                  style={{objectFit:"cover"}}
                  priority={true}
                  />
                </button>
                <button
                  className="border-0 bg-transparent p-0 hover:underline"
                  onClick={() => router.push('/artists/' + topArtists.items[1].id)}
                >
                  <p>{topArtists.items[1].name}</p>
                </button>
              </div>
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/artists/' + topArtists.items[2].id)}
                    aria-label={`View ${topArtists.items[2].name}'s details`}
                  >
                    <Image
                    src={topArtists.items[2].images[1].url}
                    alt="Top artists Icon 3"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/artists/' + topArtists.items[2].id)}
                  >
                    <p>{topArtists.items[2].name}</p>
                  </button>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/artists/' + topArtists.items[3].id)}
                    aria-label={`View ${topArtists.items[3].name}'s details`}
                  >
                    <Image
                    src={topArtists.items[3].images[1].url}
                    alt="Top artists Icon 4"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/artists/' + topArtists.items[3].id)}
                  >
                    <p>{topArtists.items[3].name}</p>
                  </button>
                </div>
              </div>
              <div className={"flex flex-col flex-1 h-full w-1/2"}>
              <div className="flex place-content-start items-center">
                  <strong className="ml-10">Top Tracks of All Time</strong>
                  <Button className="ml-20"
                   variant="ghost"
                   onClick={()=>{
                    router.push('/tracks')
                  }}
                   >More...</Button>
                </div> 
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/tracks/' + topTracks.items[0].id)}
                    aria-label={`View ${topTracks.items[0].name}'s details`}
                  >
                    <Image
                    src={topTracks.items[0].album.images[1].url}
                    alt="Top track Icon 1"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/tracks/' + topTracks.items[0].id)}
                  >
                    <p>{topTracks.items[0].name}</p>
                  </button>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/tracks/' + topTracks.items[1].id)}
                    aria-label={`View ${topTracks.items[1].name}'s details`}
                  >
                    <Image
                    src={topTracks.items[1].album.images[1].url}
                    alt="Top track Icon 2"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/tracks/' + topTracks.items[1].id)}
                  >
                    <p>{topTracks.items[1].name}</p>
                  </button>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/tracks/' + topTracks.items[2].id)}
                    aria-label={`View ${topTracks.items[2].name}'s details`}
                  >
                    <Image
                    src={topTracks.items[2].album.images[1].url}
                    alt="Top track Icon 3"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/tracks/' + topTracks.items[2].id)}
                  >
                    <p>{topTracks.items[2].name}</p>
                  </button>
                </div>
                <div className="flex flex-row w-full mt-4 items-center">
                  <button
                    className="rounded-full h-16 w-16 overflow-hidden mr-8 ml-10 border-0 bg-transparent p-0"
                    onClick={() => router.push('/tracks/' + topTracks.items[3].id)}
                    aria-label={`View ${topTracks.items[3].name}'s details`}
                  >
                    <Image
                    src={topTracks.items[3].album.images[1].url}
                    alt="Top track Icon 4"   
                    width={64}
                    height={64}
                    style={{objectFit:"cover"}}
                    priority={true}
                    />
                  </button>
                  <button
                    className="border-0 bg-transparent p-0 hover:underline"
                    onClick={() => router.push('/tracks/' + topTracks.items[3].id)}
                  >
                    <p>{topTracks.items[3].name}</p>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

