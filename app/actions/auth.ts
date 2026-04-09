"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function signUp(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const username = formData.get("username") as string
  const gender = formData.get("gender") as string
  const birthDate = formData.get("birth_date") as string

  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) return { error: error.message }
  if (!data.user) return { error: "Não foi possível criar a conta. Tente novamente." }

  const admin = createAdminClient()
  await admin.from("user_information").insert({
    user_id: data.user.id,
    username: username || null,
    gender: gender || null,
    birth_date: birthDate || null,
  })

  revalidatePath("/", "layout")
  redirect("/login?registered=1")
}

export async function signIn(formData: FormData) {
  const supabase = await createClient()

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { error: error.message }

  revalidatePath("/", "layout")
  redirect("/chat")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath("/", "layout")
  redirect("/")
}
