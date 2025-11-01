"use client"

import { usePathname, useRouter } from "next/navigation"
import useSWR from "swr"
import { authAPI } from "@/lib/api"
import Topbar from "@/components/TopBar"
import { useEffect } from "react"

export default function AuthLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname();

  
  // Check if company is logged in
  const { data, error, isLoading } = useSWR( "/auth/companyin", () => authAPI.companyIn().then(res => res.data.data), { revalidateOnFocus: false, shouldRetryOnError: false, } )

  useEffect(() => {

    if (data && !isLoading && pathname === "/login") {
      router.push("/")
      return
    }
    if (error || (!isLoading && !data)) {
      router.push("/login")
    }
  }, [data, error, isLoading, router])

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          {/* <p className="mt-4 text-white/70">Checking authentication...</p> */}
        </div>
      </div>
    )
  }

  // Show error message if auth fails
  // if (error || !data) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
  //           <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
  //           </svg>
  //         </div>
  //         <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
  //         <p className="text-white/70 mb-4">Please log in to access this page.</p>
  //         <button
  //           onClick={() => router.push("/login")}
  //           className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg text-white font-medium transition-colors"
  //         >
  //           Go to Login
  //         </button>
  //       </div>
  //     </div>
  //   )
  // }

const shouldHide = pathname.startsWith("/login");


  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-slate-700">
     {!shouldHide && <Topbar companyData={data} />}
      {children}
    </div>
  )
}