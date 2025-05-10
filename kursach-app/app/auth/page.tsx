import { AuthForm } from "@/components/auth/auth-form"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Illustration/Branding */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-green-400 to-green-600 p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <defs>
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <div className="flex items-center">
              <img
                src="/simple-gray-globe.png"
                alt="Логотип Страны"
                className="w-12 h-12 mr-4 filter brightness-0 invert"
              />
              <h1 className="text-3xl font-bold text-white">Страны</h1>
            </div>
            <p className="text-white/80 mt-6 text-lg max-w-md">
              Проверь свои знания географии в ежедневной игре на угадывание страны. Испытай себя и узнай больше о мире!
            </p>
          </div>

          <div className="mt-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-start mb-4">
                <div className="text-4xl mr-4">⭐</div>
                <div>
                  <h3 className="text-white font-medium text-lg">Ежедневные задания</h3>
                  <p className="text-white/70">Каждый день — новая страна для угадывания</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="text-4xl mr-4">🌍</div>
                <div>
                  <h3 className="text-white font-medium text-lg">Изучай географию</h3>
                  <p className="text-white/70">Узнавай интересные факты о странах мира</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md">
          <AuthForm />
        </div>
      </div>
    </div>
  )
}
