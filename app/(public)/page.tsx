import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookOpen, Heart, Search, Clock, User, Compass, BookMarked, Church } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import { ThemeToggle } from "@/components/shared/ThemeToggle"
import { UserMenu } from "@/components/shared/UserMenu"

const useCases = [
  {
    icon: Heart,
    title: "Situações de vida e emoções",
    description: "Luto, ansiedade, perdão, propósito, medo, traição — encontre o que a Bíblia diz sobre o que você está vivendo.",
  },
  {
    icon: Search,
    title: "Estudo temático e doutrinário",
    description: "O que a Bíblia diz sobre casamento, dinheiro, sofrimento, oração, salvação? Busca temática com profundidade.",
  },
  {
    icon: BookMarked,
    title: "Compreensão de livros e capítulos",
    description: "Resumos, temas centrais, contexto narrativo — entenda a estrutura de cada livro e o que acontece em cada seção.",
  },
  {
    icon: Clock,
    title: "Perguntas históricas",
    description: "O exílio, a Igreja primitiva, os patriarcas, o reinado de Davi — respostas com contexto histórico e cronológico.",
  },
  {
    icon: User,
    title: "Estudo de personagens",
    description: "Davi, Rute, Paulo, os profetas — trajetórias, falhas, chamados e lições baseadas no texto bíblico.",
  },
  {
    icon: Compass,
    title: "Orientação de leitura",
    description: "Por onde começar, o que ler a seguir, qual livro se encaixa no que você está vivendo agora.",
  },
  {
    icon: Church,
    title: "Liturgia e vida da Igreja",
    description: "Tempo litúrgico atual, Evangelho do domingo, Catecismo, dias de santos, concílios e documentos da Igreja.",
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: userInfo } = user
    ? await supabase.from("user_information").select("username").eq("user_id", user.id).single()
    : { data: null }

  return (
    <main className="min-h-full flex flex-col">
      {/* Nav */}
      <nav className="border-b px-5 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          <span className="font-semibold text-sm">Bible Copilot</span>
        </div>
        <div className="flex items-center gap-3">
          {user?.email && <UserMenu email={user.email} username={userInfo?.username} />}
          <ThemeToggle />
          <Link href={user ? "/chat" : "/login"}>
            <Button variant="outline" size="sm">
              {user ? "Conversar" : "Entrar"}
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-12 border-b">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Seu assistente para explorar a Bíblia e a fé cristã
          </h1>
          <p className="text-base text-muted-foreground leading-relaxed">
            Pergunte em linguagem comum sobre qualquer aspecto das Escrituras ou da vida cristã — situações de vida, temas doutrinários, personagens, história, liturgia e muito mais.
          </p>
          <div className="pt-1">
            <Link href={user ? "/chat" : "/login"}>
              <Button size="default">{user ? "Continuar conversando" : "Começar agora"}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="px-6 py-10">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-7">O que você pode perguntar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {useCases.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.title} className="p-4 rounded-lg border bg-background space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <h3 className="text-sm font-medium">{item.title}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-4 mt-auto text-center text-xs text-muted-foreground">
        Bible Copilot — Exploração das Escrituras com IA
      </footer>
    </main>
  )
}
