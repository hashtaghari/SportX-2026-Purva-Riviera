import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.SPORTX_ADMIN_EMAIL;
const password = process.env.SPORTX_ADMIN_PASSWORD;
const fullName = process.env.SPORTX_ADMIN_NAME ?? "SportX Admin";

if (!url || !serviceRoleKey || !email || !password) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SPORTX_ADMIN_EMAIL, or SPORTX_ADMIN_PASSWORD.",
  );
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: created, error: createError } =
  await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName },
  });

let user = created.user;

if (createError?.message.toLowerCase().includes("already been registered")) {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) throw error;
  user = data.users.find((candidate) => candidate.email === email) ?? null;
} else if (createError) {
  throw createError;
}

if (!user) {
  throw new Error(`Could not find or create admin user ${email}.`);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  password,
  email_confirm: true,
});
if (updateError) throw updateError;

const { error: profileError } = await supabase.from("admin_profiles").upsert({
  user_id: user.id,
  full_name: fullName,
  role: "super_admin",
  active: true,
});
if (profileError) throw profileError;

console.log(`SportX super admin ready: ${email}`);
