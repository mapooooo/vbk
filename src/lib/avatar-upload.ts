import type { SupabaseClient } from "@supabase/supabase-js";

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;
export const AVATAR_ACCEPT = "image/jpeg,image/png,image/webp";
export const AVATAR_BUCKET = "avatars";

const extByMime: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function validateAvatarFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Vælg et billedfil (JPG, PNG eller WebP).";
  }
  if (!extByMime[file.type]) {
    return "Kun JPG, PNG og WebP understøttes.";
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return "Billedet må højst være 5 MB.";
  }
  return null;
}

export function avatarStoragePath(userId: string, mimeType: string): string {
  const ext = extByMime[mimeType] ?? "jpg";
  return `${userId}/avatar.${ext}`;
}

export async function uploadAvatar(
  supabase: SupabaseClient,
  userId: string,
  file: File
): Promise<string> {
  const validationError = validateAvatarFile(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const path = avatarStoragePath(userId, file.type);
  const { error } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, file, { upsert: true, contentType: file.type });

  if (error) {
    throw error;
  }

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

export async function removeAvatarFiles(
  supabase: SupabaseClient,
  userId: string
): Promise<void> {
  const { data: files } = await supabase.storage
    .from(AVATAR_BUCKET)
    .list(userId);

  if (!files?.length) return;

  const paths = files.map((f) => `${userId}/${f.name}`);
  await supabase.storage.from(AVATAR_BUCKET).remove(paths);
}
