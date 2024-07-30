"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1 className="text-3xl font-thin text-center">hello 123</h1>
      <Image
        src="/images/mew.jpg"
        alt="mew"
        width={200}
        height={200}
        quality={100}
      />
    </main>
  );
}
