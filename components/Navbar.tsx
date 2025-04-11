import { AvatarIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React, { useState } from "react";
import { Database } from "@/types/supabase";
import ClientSideCredits from "./realtime/ClientSideCredits";

export const dynamic = "force-dynamic";

const stripeIsConfigured = process.env.NEXT_PUBLIC_STRIPE_IS_ENABLED === "true";

export const revalidate = 0;

export default function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState<any>(null);

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    };

    const fetchCredits = async () => {
      if (user) {
        const { data } = await supabase
          .from("credits")
          .select("*")
          .eq("user_id", user.id)
          .single();
        setCredits(data);
      }
    };

    fetchUser();
    if (user) {
      fetchCredits();
    }
  }, [supabase, user]);

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    await supabase.auth.signOut();
    setUser(null);
    setCredits(null);
  };

  return (
    <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between">
      <div className="flex gap-2 h-full items-center">
        <Link href="/">
          <h2 className="font-bold text-2xl">Headshots AI</h2>
        </Link>
        <div className="hidden lg:flex flex-row gap-4 ml-8">
          <Link href="/overview">
            <Button variant={"ghost"}>Home</Button>
          </Link>
          {stripeIsConfigured && (
            <Link href="/get-credits">
              <Button variant={"ghost"}>Get Credits</Button>
            </Link>
          )}
          <form onSubmit={handleSearch} className="flex">
            <input
              type="text"
              placeholder="Search..."
              className="border border-gray-300 rounded px-4 py-2 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button type="submit" variant={"ghost"} className="ml-2">
              Search
            </Button>
          </form>
        </div>
      </div>
      <div className="flex gap-4 lg:ml-auto items-center">
        {!user && (
          <Link href="/login">
            <Button variant={"ghost"}>Login / Signup</Button>
          </Link>
        )}
        {user && (
          <div className="flex flex-row gap-4 text-center align-middle justify-center">
            {stripeIsConfigured && (
              <ClientSideCredits creditsRow={credits ? credits : null} />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <AvatarIcon height={32} width={32} className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Button variant={"ghost"} className="w-full text-left">
                      Profile
                    </Button>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <form action="/auth/sign-out" method="post" onSubmit={handleLogout}>
                    <Button
                      type="submit"
                      className="w-full text-left"
                      variant={"ghost"}
                    >
                      Log out
                    </Button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}

const handleSearch = async (e: React.FormEvent) => {
  e.preventDefault();
  // Implement search logic here
  console.log("Search query:", searchQuery);
};

const [searchQuery, setSearchQuery] = useState<string>("");