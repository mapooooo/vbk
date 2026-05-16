import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MembershipApplicationForm } from "@/components/public/membership-application-form";

export default function BlivMedlemPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="font-serif text-3xl">Bliv medlem</CardTitle>
          <CardDescription className="text-base leading-relaxed">
            Vandel Brugshundeklub er invite-only. Udfyld ansøgningen — bestyrelsen
            vender tilbage med invitation til platformen, når du er klar til at
            starte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MembershipApplicationForm />
        </CardContent>
      </Card>
    </div>
  );
}
