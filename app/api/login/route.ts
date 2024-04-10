import type { NextApiRequest, NextApiResponse } from 'next'
import { NextResponse, NextRequest } from 'next/server'
import { randomUUID } from 'crypto' 
import querystring from 'querystring';


 
export async function GET(
  req: NextRequest,
) {
        console.log("api trigger")
        const state = randomUUID().substring(16);
        const scope = 'user-read-private user-read-email';
        const redirectUri = 'https://accounts.spotify.com/authorize?' +
        querystring.stringify({
          response_type: 'code',
          client_id: process.env.CLIENT_ID,
          scope: scope,
          redirect_uri: process.env.REDIRECT_URI,
          state: state
        })
        return NextResponse.redirect(redirectUri);
}