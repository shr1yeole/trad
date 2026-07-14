import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function SettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account and platform preferences.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <aside className="md:w-1/4">
          <nav className="flex md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0">
            <Button variant="secondary" className="justify-start shadow-[inset_0_0_10px_rgba(173,198,255,0.05)] bg-white/5 border border-white/10">Profile</Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5">Account</Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5">Appearance</Button>
            <Button variant="ghost" className="justify-start text-muted-foreground hover:bg-white/5">API & Integrations</Button>
          </nav>
        </aside>

        <div className="flex-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>Update your personal information and avatar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-muted border border-white/10 flex items-center justify-center text-xl font-bold text-muted-foreground">
                  JD
                </div>
                <Button variant="outline" size="sm">Change Avatar</Button>
              </div>

              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" defaultValue="John Doe" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@example.com" disabled className="opacity-50" />
                  <p className="text-[0.8rem] text-muted-foreground">Contact support to change your email address.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Trading Preferences</CardTitle>
              <CardDescription>Configure how your trades and P&L are displayed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="currency">Base Currency</Label>
                <select id="currency" className="h-9 w-full min-w-0 rounded-lg border border-input/30 bg-[#0E1628]/40 px-3 py-1 text-base transition-all outline-none focus-visible:border-primary focus-visible:ring-[4px] focus-visible:ring-primary/20 md:text-sm">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="ghost">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
