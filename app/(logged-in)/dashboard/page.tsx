import BgGradient from "@/components/common/bg-gradient";
import { Badge } from "@/components/ui/badge";
//import UpgradeYourPlan from "@/components/upload/upgrade-your-plan";
import UploadForm from "@/components/upload/upload-form";
import getDbConnection from "@/lib/db";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return redirect("/sign-in");
  }

  const email = clerkUser?.emailAddresses?.[0].emailAddress ?? "";

  const sql = await getDbConnection();


  // check number of posts per plan

  return (
    <BgGradient>
      <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="flex flex-col items-center justify-center gap-6 text-center">
          <Badge className="bg-gradient-to-r from-purple-700 to-pink-800 text-white px-4 py-1 text-lg font-semibold capitalize">
          </Badge>

          <h2 className="capitalize text-3xl font-bold tracking-tight text-white-900 sm:text-4xl">
            Start creating amazing content
          </h2>

          <p className="mt-2 text-lg leading-8 text-white-600 max-w-2xl text-center">
            Upload your audio or video file and let our AI do the magic!
          </p>

          
            <p className="mt-2 text-lg leading-8 text-white-600 max-w-2xl text-center">
              Note: Please upload the video whose length is below 30 Mins. 
            </p>
          
            <BgGradient>
              <UploadForm />
            </BgGradient>
        </div>
      </div>
    </BgGradient>
  );
}
