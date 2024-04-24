"use client"
import { Button } from "@/components/ui/button";
import { METHODS } from "http";
import { createHash } from 'crypto'
import querystring from 'querystring';
import { redirect } from "next/dist/server/api-utils";
import { useEffect, useState } from "react";
import { isUndefined } from "util";
import { apiCall } from "./utils";
import { access } from "fs";
import { useTheme } from "next-themes";

export default function Home() {
  interface imageBody {
    url: string,
    height: number,
    width: number
  }

  interface userDataResponse {
    country: string,
    display_name: string,
    email: string,
    id: string,
    image: imageBody[],
    uri: string
  }

  const [isLogin, setIsLogin] = useState(false)
  const [userData, setUserData] = useState<userDataResponse>({})
  const { theme, setTheme } = useTheme()
  const generateRandomString = (length: number): string => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint8Array(length));
    return Array.from(values)
      .map((x) => possible[x % possible.length])
      .join("");
  }

  const sha256 = async (plain: string): Promise<string> => {
    const hash = createHash('sha256');
    hash.update(plain);
    return hash.digest('hex');
  }

  const base64encode = (input: Uint8Array): string => {
    return btoa(String.fromCharCode(...Array.from(input)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  const getToken = async (code: string) => {
    // stored in the previous step
    console.log("getToken is called")
    let codeVerifier = localStorage.getItem('code_verifier');
    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
        grant_type: 'authorization_code',
        code,
        redirect_uri: process.env.NEXT_PUBLIC_HOST,
        code_verifier: codeVerifier,
      }),
    }
    let url = "https://accounts.spotify.com" + "/api/token"
    const body = await fetch(url, payload);
    const response = await body.json();
    if (body.status === 200) {
      console.log("from response time", response.expires_in, response.expires_in + Date.now())
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('expire', parseInt(response.expires_in) + Date.now());
      setIsLogin(true)
    }

  }

  const loginHandler = async () => {
    try {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('code_verifier')
      localStorage.removeItem('expire')
      const codeVerifier: string = generateRandomString(64);
      const hashed = await sha256(codeVerifier);
      const codeChallenge = base64encode(Buffer.from(hashed, 'hex'));
      const scope = 'user-read-private user-read-email';
      window.localStorage.setItem('code_verifier', codeVerifier);
      const redirectUri = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.NEXT_PUBLIC_HOST,
          code_challenge_method: "S256",
          code_challenge: codeChallenge
        })
      window.location.replace(redirectUri)
    } catch (err) {
      console.log(err);
    }
  }



  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let accessToken = localStorage.getItem('access_token');
    console.log("the token", accessToken, typeof (accessToken), isLogin, code, accessToken == null || accessToken == "undefined")
    if (!isLogin && code) {
      if (accessToken == null || accessToken == "undefined") {
        console.log("function should trigger")
        return () => getToken(code)
      } else {
        setIsLogin(true)
      }
    }
  }, [])

  useEffect(() => {
    if (isLogin) {
      async function fetchData() {
        try {
          const result = await apiCall(process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + 'v1/me');
          // Handle the resolved data here
          console.log(result);
          setUserData(result)
        } catch (error) {
          // Handle any errors that occurred during the API call
          console.log(error);
        }
      }

      fetchData();
    }
  }, [isLogin])

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
    {isLogin && !!userData && 
    <div className="flex flex-grow flex-col min-h-screen min-w-screen items-center justify-center">
          <div className={"min-h-2/5 w-4/5 " + (theme === "dark" ? "border-white" : "border-black") + " border-b-4"}>
            <h1>hi</h1>
          </div>
          {/* <div className={"min-h-2/3 w-4/5 "}>
            <h1>hii</h1>
          </div> */}
      </div>
        }
  </div>
    </main>
  )
}
