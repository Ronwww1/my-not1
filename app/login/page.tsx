import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { useEffect } from "react";
import { Database } from "../../types/supabase"; // Update the path as necessary
import { Login } from "./components/Login";

export const dynamic = "force-dynamic";

export default function LoginPage({ searchParams }) {
  const supabase = createServerComponentClient({ cookies });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else if (data.user) {
        redirect("/");
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const headersList = headers();
  const host = headersList.get("host");

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-col flex-1 w-full h-[calc(100vh-73px)]">
      <Login host={host} searchParams={searchParams} />
    </div>
  );
}