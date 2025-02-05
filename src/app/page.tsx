'use client'

import Login from "@/components/sections/login";
import RegisterUser from "@/components/sections/register";
import Wallets from "@/components/sections/wallets";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="flex flex-col w-full h-full items-center gap-8">
        <h1 className="text-5xl font-bold"> {"Dfns - JustAName"}</h1>
        <div className="flex flex-col gap-5 w-full items-center">
          <RegisterUser />
          <Login />
          <Wallets />
        </div>
      </div>
    </div>
  );
}
