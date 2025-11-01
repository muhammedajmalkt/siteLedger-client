"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { UserPlus, Eye, EyeOff } from "lucide-react"
import { authAPI } from "@/lib/api" // use the API wrapper

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const {data} = await authAPI.register({ name, email, password })
      if (data.success) {
        router.replace("/login") // redirect after successful registration
      } else {
        setError(data.message || "Registration failed")
      }
    } catch (err) {
        console.log(err);
        
      if (err.response) {
        setError(err.response.data.message || "Registration failed")
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -inset-[10px] opacity-50">
          <div className="absolute top-1/4 left-1/4 h-72 w-72 rounded-full bg-gradient-to-r from-blue-900 to-cyan-600 blur-3xl"></div>
          <div className="absolute bottom-1/4 left-1/2 h-72 w-72 rounded-full bg-gradient-to-r from-indigo-800 to-purple-600 blur-3xl"></div>
        </div>
      </div>

      <div className="relative flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Card with glass morphism effect */}
          <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-7">
            <div className="mb-8 text-center">
              <UserPlus className="mx-auto h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold text-white mb-2">Create your company</h1>
              <p className="text-sm text-white/70">
                Register to start tracking construction finances.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Company Name
                </label>
                <input
                  className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="Acme Builders"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-white">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="w-full border border-white/20 bg-white/10 px-3 py-2 rounded-lg pr-12 text-white placeholder-white/50 backdrop-blur-sm transition-all duration-200 focus:border-white/40 focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-white/20"
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/70 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-red-500/20 border border-red-500/30 px-4 py-3">
                  <p className="text-sm text-red-200">{error}</p>
                </div>
              )}

              <button
                disabled={loading}
                className="w-full bg-primary px-3 py-2 rounded-lg font-medium text-white shadow-lg transition-all duration-200 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span className="ml-2">Creating account...</span>
                  </div>
                ) : (
                  "Register"
                )}
              </button>

              <p className="text-center text-sm text-white/70">
                Already have an account?{" "}
                <Link 
                  className="font-medium text-white underline underline-offset-2 hover:text-white/90 transition-colors" 
                  href="/login"
                >
                  Login
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}