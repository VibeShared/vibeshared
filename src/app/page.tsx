// app/page.tsx (server component)
import ProfilePage from "@/componenets/Home/profile";
import connectdb from "@/lib/Connect";
import Post from "@/lib/models/Post";

export default async function HomePage() {

  return (
    <ProfilePage />
  );
}
