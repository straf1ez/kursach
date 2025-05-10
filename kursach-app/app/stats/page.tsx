import { AppShell } from "@/components/layout/app-shell"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Trophy, Flame, Clock, Target, Globe, BarChart2, CheckCircle2, Circle } from "lucide-react"
import { createClient } from "@/utils/auth/server"
import { redirect } from "next/navigation"

export default async function StatsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth")
  const { data: gamesRaw } = await supabase
    .from("games")
    .select("*")
    .eq("user_id", user.id)
    .order("finished_at", { ascending: false })
  const games = gamesRaw ?? []

  // Получаем достижения пользователя из новой таблицы
  const { data: userAchievementsRaw } = await supabase
    .from("user_achievements")
    .select("achievement_code, unlocked_at")
    .eq("user_id", user.id)
  const userAchievements = userAchievementsRaw?.map(a => a.achievement_code) ?? []

  const totalGames = games.length
  const wins = games.filter(g => g.result === "won").length
  const losses = games.filter(g => g.result === "lost").length
  const winRate = totalGames ? Math.round((wins / totalGames) * 100) : 0
  const averageAttempts = totalGames ? (games.reduce((acc, g) => acc + (g.attempts || 0), 0) / totalGames) : 0

  // streaks
  let bestStreak = 0, streak = 0
  for (const g of games) {
    if (g.result === "won") {
      streak++
      bestStreak = Math.max(bestStreak, streak)
    } else {
      streak = 0
    }
  }
  // currentStreak: подряд идущие победы с конца массива
  let currentStreak = 0
  for (let i = games.length - 1; i >= 0; i--) {
    if (games[i].result === "won") {
      currentStreak++
    } else {
      currentStreak = 0
    }
  }

  // Список всех достижений (маппинг кодов)
  const allAchievements = [
    {
      code: "first_win",
      name: "Первая победа",
      description: "Выиграйте свою первую игру",
      icon: <Trophy size={28} />,
    },
    {
      code: "streak_master",
      name: "Серия побед",
      description: "Выиграйте 5 игр подряд",
      icon: <Flame size={28} />,
    },
    {
      code: "speed_demon",
      name: "Скоростной игрок",
      description: "Победите менее чем за 2 минуты",
      icon: <Clock size={28} />,
    },
    {
      code: "sharpshooter",
      name: "Меткий стрелок",
      description: "Победите за 3 или меньше попыток",
      icon: <Target size={28} />,
    },
    {
      code: "globe_trotter",
      name: "Путешественник",
      description: "Сыграйте 20 игр",
      icon: <Globe size={28} />,
    },
  ]

  // Маппим достижения пользователя
  const achievements = allAchievements.map(a => ({
    ...a,
    unlocked: userAchievements.includes(a.code),
  }))

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-4xl mx-auto px-2 pb-12">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ваша статистика</h1>
          <p className="text-gray-600">Следите за своим прогрессом и достижениями</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Сыграно игр" value={totalGames.toString()} />
          <StatCard title="Победы" value={wins.toString()} />
          <StatCard title="Процент побед" value={winRate + '%'} />
          <StatCard title="Текущая серия" value={currentStreak.toString()} />
          <StatCard title="Лучшая серия" value={bestStreak.toString()} />
          <StatCard title="Среднее попыток" value={averageAttempts.toFixed(1)} />
        </div>

        <Tabs defaultValue="achievements" className="w-full mt-6">
          <TabsList className="w-full grid grid-cols-2 bg-gray-100 rounded-md mb-4">
            <TabsTrigger value="achievements" className="w-full">Достижения</TabsTrigger>
            <TabsTrigger value="history" className="w-full">История игр</TabsTrigger>
          </TabsList>
          <TabsContent value="achievements">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.map(a => (
                <AchievementCard key={a.code} achievement={a} />
              ))}
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="space-y-4">
              {games.length === 0 && (
                <div key="empty" className="text-center text-gray-400 py-12">Пока нет сыгранных игр.</div>
              )}
              {games.map((g) => (
                <div key={g.id} className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row md:items-center md:justify-between shadow-sm">
                  <div className="flex items-center space-x-4 mb-2 md:mb-0">
                    <span className={`font-bold text-lg ${g.result === 'won' ? 'text-green-600' : 'text-red-500'}`}>{g.result === 'won' ? 'Победа' : 'Поражение'}</span>
                    <span className="text-gray-500">{g.target_country}</span>
                    <span className="text-gray-400 text-sm">{g.difficulty}</span>
                  </div>
                  <div className="flex items-center space-x-6 text-sm">
                    <span>Попыток: <b>{g.attempts}</b></span>
                    {g.finished_at && (
                      <span className="text-gray-400">{new Date(g.finished_at).toLocaleString()}</span>
                    )}
                    {g.started_at && g.finished_at && (
                      <span className="text-gray-400">Время: <b>{Math.round((new Date(String(g.finished_at)).getTime() - new Date(String(g.started_at)).getTime()) / 1000)} сек</b></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  )
}

function StatCard({ title, value }: { title: string, value: string }) {
  return (
    <Card className="shadow-none border border-gray-200 bg-white">
      <CardContent className="p-6 flex flex-col items-start">
        <div className="text-sm font-medium text-gray-500">{title}</div>
        <div className="text-3xl font-bold mt-2">{value}</div>
      </CardContent>
    </Card>
  )
}

function AchievementCard({ achievement }: { achievement: { code: string, name: string, description: string, unlocked: boolean, icon: React.ReactNode } }) {
  return (
    <Card className={`border-2 ${achievement.unlocked ? "border-green-200 bg-green-50" : "border-gray-100 bg-gray-50 opacity-70"}`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className={`p-3 rounded-full ${achievement.unlocked ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-400"}`}>
            {achievement.icon}
          </div>
          <div>
            <h3 className="font-bold flex items-center">
              {achievement.name}
              {achievement.unlocked && <Award size={16} className="ml-2 text-yellow-500" />}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{achievement.description}</p>
            <div className="mt-2 text-xs font-medium">
              {achievement.unlocked ? (
                <span className="text-green-600">Открыто</span>
              ) : (
                <span className="text-gray-400">Закрыто</span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
