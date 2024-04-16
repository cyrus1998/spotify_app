import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import { createHash } from 'crypto' 
import querystring from 'querystring';
import { headers } from 'next/headers';


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



export async function GET(
  req: NextRequest,
) {
        const codeVerifier: string = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(Buffer.from(hashed, 'hex'));
        window.localStorage.setItem('code_verifier', codeVerifier);
        const scope = 'user-read-private user-read-email';
        const redirectUri = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.NEXT_PUBLIC_CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.NEXT_PUBLIC_REDIRECT_URI,
          code_challenge_method: "S256",
          code_challenge: codeChallenge
        })
        console.log("redirect uri",redirectUri)
        return NextResponse.redirect(redirectUri);
}