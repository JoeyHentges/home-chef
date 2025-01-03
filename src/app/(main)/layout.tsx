import { getCurrentUser } from "@/lib/session"
import { SiteHeader } from "@/containers/site-header"
import { SiteFooter } from "@/components/site-footer"

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getCurrentUser()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader user={user} />
      <main className="flex-1 pb-4">{children}</main>
      <SiteFooter />
    </div>
  )
}
