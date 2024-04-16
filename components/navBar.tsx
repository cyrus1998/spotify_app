import Image from "next/image";
import { Button } from "./ui/button";
import { Sun,Moon } from 'lucide-react';
import { useTheme } from "next-themes";
import { useState, useEffect } from 'react'


const NavBar = (props:any) => {
    const [mounted, setMounted] = useState(false)
    const { theme, setTheme } = useTheme()

    useEffect(() => {
        setMounted(true)
      }, []) //prevent theme = undefined

      if (!mounted) {
        return null
      }
    return(
        theme=="light" ?
        <div className="w-screen bg-black flex flex-row justify-between items-center">
        <Image
        src="/img/Spotify_Logo_CMYK_White.png"
        alt="spotify white logo"   
        width={200}
        height={60}     
        priority={true}
        quality={50}
        />
        <Button variant="ghost" size="icon" className="bg-black hover:bg-white-200 mr-12" onClick={()=>{setTheme('dark')}}>
        <Sun color="white"/>
        </Button>
    </div> : 
        <div className="w-screen bg-white flex flex-row justify-between items-center">
        <Image
        src="/img/Spotify_Logo_CMYK_Black.png"
        alt="spotify white logo"   
        width={200}
        height={60}     
        />
        <Button variant="ghost" size="icon" className="bg-white hover:bg-black-200 mr-12" onClick={()=>{setTheme('light')}}>
        <Moon color="black"/>
        </Button>
    </div>
        
        

    
)
}

// const NavBar = (theme:string, useTheme:) => {

// }
export default NavBar