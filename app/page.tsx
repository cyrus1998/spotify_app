"use client"
import { Button } from "@/components/ui/button";
import { METHODS } from "http";
export default function Home() {

  const loginHandler = async () => {
    try {
			const res = await fetch(
				`/api/login`
			);
			const data = await res.json();
			console.log(data);
		} catch (err) {
			console.log(err);
		}
  }

  return (
    <main>
      <div className="h-screen flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-8">
        <strong className="text-3xl">Soptify Profile</strong>
        <Button size={"lg"} onClick={()=>loginHandler()}>Login</Button>
        </div>
        
      </div>
    </main>
  );
}
