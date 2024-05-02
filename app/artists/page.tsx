"use client"

import { useEffect,useState } from "react"
import { apiCall } from "../utils";

export default function Artists() {
    const [topArtists, setTopArtists] = useState<any>({});
    const [timeRange, setTimeRange] = useState<string>("short_term");
    useEffect(()=>{
        const fetchData = setTopArtists(() => apiCall(process.env.NEXT_PUBLIC_SPOTIFY_API_HOST + `v1/me/top/artists?time_range=${timeRange}&limit=50`))
        return () => fetchData;
        },[])

    return(
        <div>Hi</div>
    )
}