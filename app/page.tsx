"use client";

import Image from "next/image";
import { Header } from "@/components/header";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <Header />
      <main className="w-full min-h-[calc(100vh-80px)] relative">
        <Image
          src="/img/quboweb.png"
          alt="Qubo Web"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </main>
    </div>
  );
}
