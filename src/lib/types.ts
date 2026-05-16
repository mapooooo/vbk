export type UserRole = "member" | "trainer" | "admin";

export type Profile = {
  id: string;
  full_name: string;
  avatar_url: string | null;
  role: UserRole;
  approved_at: string | null;
  created_at: string;
};

export type ProfilePreview = Pick<Profile, "id" | "full_name" | "avatar_url">;

export type Post = {
  id: string;
  title: string;
  body: string;
  starts_at: string | null;
  location: string | null;
  author_id: string;
  is_pinned: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  author?: Profile;
  like_count?: number;
  comment_count?: number;
  liked_by_me?: boolean;
};

export type PostComment = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  author?: Profile;
};

export type Conversation = {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  other_user?: Profile;
  last_message?: string;
  last_message_at?: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type Event = {
  id: string;
  title: string;
  description: string;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  capacity: number | null;
  price_cents: number;
  stripe_price_id: string | null;
  created_by: string;
  published: boolean;
  created_at: string;
  registration_count?: number;
  my_registration?: {
    status: "registered" | "cancelled" | "waitlist";
    payment_status: string;
  } | null;
};

export type ApplicationStatus = "pending" | "invited" | "rejected";

export type MembershipApplication = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  message: string;
  dog_info: string | null;
  status: ApplicationStatus;
  invite_id: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
};

export type Invite = {
  id: string;
  token: string;
  email: string | null;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};
