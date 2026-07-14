export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        <div className="bg-card border border-white/5 rounded-2xl p-8 shadow-xl backdrop-blur-sm">
          {children}
        </div>
      </div>
    </div>
  )
}
