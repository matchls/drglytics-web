import UploadForm from "@/components/UploadForm";
import PrivacyBanner from "@/components/PrivacyBanner";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="p-3 md:p-6 flex flex-col gap-4">
      <PrivacyBanner />
      <UploadForm isLoggedIn={!!user} />
    </main>
  );
}
