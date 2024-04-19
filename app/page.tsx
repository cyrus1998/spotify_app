"use client"
import { Button } from "@/components/ui/button";
import { METHODS } from "http";
import { createHash } from 'crypto' 
import querystring from 'querystring';
import { redirect } from "next/dist/server/api-utils";
import { useEffect,useState } from "react";
import { isUndefined } from "util";
import { apiCall } from "./utils";
import { access } from "fs";

export default function Home() {
  const [isLogin, setIsLogin] = useState(false)
  const [tokenRetrievalInitiated, setTokenRetrievalInitiated] = useState(false);
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
  
  const getToken = async code => {
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
    const response =await body.json();
    if (body.status === 200){
      console.log("successfully call get token")
      setTimeout(() => {
      localStorage.setItem('access_token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token);
      localStorage.setItem('expire', response.expires_in + Date.now());
      setIsLogin(true)
      }, 100);
      
    }
    
  }

  const loginHandler = async () => {
    try {
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

  

  useEffect( ()=>{
    const urlParams = new URLSearchParams(window.location.search);
    let code = urlParams.get('code');
    let accessToken = localStorage.getItem('access_token');
    console.log("the token",accessToken,typeof(accessToken),accessToken === "undefined" || accessToken === null)
    if(!isLogin && code !== null && !tokenRetrievalInitiated){
      setTokenRetrievalInitiated(true); // Mark the token retrieval process as initiated
      console.log("the token 2!",accessToken,typeof(accessToken),accessToken === "undefined" || accessToken === null)
      if(accessToken === "undefined" || accessToken === null){
        console.log("function should trigger")
        getToken(code)
    }else if(tokenRetrievalInitiated && code !==null){
      setIsLogin(true)
    }
    }
},[isLogin, tokenRetrievalInitiated])

  useEffect(()=>{
    if(isLogin){
    const result = apiCall(process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + 'v1/me')
    console.log("profile api call",result)
    }
  },[isLogin])

  return (
    <main>
      <div className="min-h-screen flex items-center justify-center">
      {!isLogin&&
        <div className="flex flex-col items-center justify-center space-y-8">
        <strong className="text-3xl">Soptify Profile</strong>
        <Button size={"lg"} onClick={()=>loginHandler()}>Login</Button>
        </div>
      }
      {isLogin&&
      <div className="flex flex-col items-center justify-center space-y-8">
      <strong className="text-3xl">Success</strong>
      </div>
      }
      </div>
    </main>
  );
}
