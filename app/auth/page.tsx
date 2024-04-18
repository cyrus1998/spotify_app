"use client"
import { Button } from "@/components/ui/button";
import { METHODS } from "http";
import { createHash } from 'crypto' 
import querystring from 'querystring';
import { redirect } from "next/dist/server/api-utils";
import { useEffect } from "react";


export default function AuthHome() {

const getToken = async code => {
    // stored in the previous step
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
        redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
        code_verifier: codeVerifier,
      }),
    }
    let url = "https://accounts.spotify.com" + "/api/token"
    const body = await fetch(url, payload);
    const response =await body.json();
  
    localStorage.setItem('access_token', response.access_token);
  }



  return (
    <main>
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-8">
        <strong className="text-3xl">Callback successfully</strong>
        </div>
      </div>
    </main>
  );
}
