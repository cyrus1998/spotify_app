"use client";
import { Button } from "@/components/ui/button";
import { createHash } from "crypto";
import querystring from "querystring";
import { useEffect, useState } from "react";
import { apiCall,getField } from "./utils";
import { useTheme } from "next-themes";
import Image from "next/image";
import { object } from "zod";

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
      console.log(
        "from response time",
        response.expires_in,
        response.expires_in + Date.now()
      );
      localStorage.setItem("access_token", response.access_token);
      localStorage.setItem("refresh_token", response.refresh_token);
      localStorage.setItem(
        "expire",
        response.expires_in + Date.now()
      );
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
      const scope = "user-read-private user-read-email user-follow-read";
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
    console.log(
      "the token",
      accessToken,
      typeof accessToken,
      isLogin,
      code,
      accessToken == null || accessToken == "undefined"
    );
    if (!isLogin && code) {
      if (accessToken == null || accessToken == "undefined") {
        console.log("function should trigger");
        getToken(code).then(()=>setIsLogin(true));
      } else {
        setIsLogin(true);
      }
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
  
  useEffect(() => {
    if (isLogin) {
      fetchData("v1/me",setUserData,""); //main profile data
    }
  }, [isLogin]);
  
  useEffect(()=>{
    if(Object.keys(userData).length>0){
      fetchData("v1/users/"+ userData.id +"/playlists",setPlayLists,"total"); //playlist data
      fetchData("v1/me/following?type=artist",setFollowing,"total"); //playlist data need fix
    }
  }, [userData])


  return (
    <main>
      <div className="min-h-screen flex items-center justify-center">
        {!isLogin && (
          <div className="flex flex-col items-center justify-center space-y-8">
            <strong className="text-3xl">Spotify Profile</strong>
            <Button size="lg" onClick={() => loginHandler()}>
              Login
            </Button>
          </div>
        )}
        {isLogin && Object.keys(userData).length>0 && (
          <div className="flex flex-grow flex-col min-h-screen min-w-screen items-center justify-center">
            <div
              className={
                "flex flex-col h-[30vh] w-4/5 " +
                (theme === "dark" ? "border-white" : "border-black") +
                " border-b-4"+ 
                " items-center"
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
              <div className="flex flex-row justify-between w-3/5 mt-8">
              <div className="flex flex-col items-center">
              <strong>Following</strong>
              <strong className="text-2xl mt-4">{following}</strong>
              </div>
              <div className="flex flex-col items-center">
              <strong>Followers</strong>
              <strong className="text-2xl mt-4">{userData.followers.total}</strong>
              </div>
              <div className="flex flex-col items-center">
              <strong>Playlist</strong>
              <strong className="text-2xl mt-4">{playLists}</strong>
              </div>
              </div>

            </div>
            <div
              className={
                "h-[50vh] w-4/5"}
            >
            </div>
            {/* <div className={"min-h-2/3 w-4/5 "}>
            <h1>hii</h1>
          </div> */}
          </div>
        )}
      </div>
    </main>
  );
}

