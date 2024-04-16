import { NextResponse, NextRequest } from 'next/server'

export async function GET(
    req: NextRequest,
  ) {
        console.log("result",)
          return NextResponse.redirect(redirectUri);
  }