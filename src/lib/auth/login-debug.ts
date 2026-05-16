export type RequestLoginDebug = {
  email: string;
  userFound: boolean;
  approved: boolean;
  emailSent: boolean;
  emailMode: "magic_link";
  supabaseError: string | null;
  hints: string[];
};
