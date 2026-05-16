import { InviteForm } from "@/components/auth/invite-form";
import { createClient } from "@/lib/supabase/server";
import { PublicHeader } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: invites } = await supabase.rpc("validate_invite", {
    p_token: token,
  });

  const invite = invites?.[0];

  return (
    <>
      <PublicHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <CardTitle className="font-serif text-2xl">Velkommen til VBK</CardTitle>
          </CardHeader>
          <CardContent>
            {!invite?.valid ? (
              <p className="text-destructive">
                Invitationen er ugyldig eller udløbet. Kontakt klubben for et nyt
                link.
              </p>
            ) : (
              <InviteForm
                token={token}
                lockedEmail={invite.email as string | null}
              />
            )}
          </CardContent>
        </Card>
      </main>
    </>
  );
}
