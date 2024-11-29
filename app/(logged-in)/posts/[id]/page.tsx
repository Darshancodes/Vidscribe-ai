import ContentEditor from "@/components/content/content-editor";
import getDbConnection from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

type Post = {
  content: string;
  title: string;
  id: string;
};

export default async function PostsPage({
  params: { id },
}: {
  params: { id: string };
}) {
  const user = await currentUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const sql = await getDbConnection();

  // Fetch posts from the database
  const posts = await sql`
    SELECT content, title, id 
    FROM posts 
    WHERE user_id = ${user.id}::uuid 
    AND id = ${id}::uuid
  `;

  // Ensure posts is correctly typed as Post[]
  const validatedPosts: Post[] = posts.map((p: any) => ({
    content: p.content,
    title: p.title,
    id: p.id,
  }));

  return (
    <div className="mx-auto w-full max-w-screen-xl px-2.5 lg:px-0 mb-12 mt-28">
      <ContentEditor posts={validatedPosts} />
    </div>
  );
}