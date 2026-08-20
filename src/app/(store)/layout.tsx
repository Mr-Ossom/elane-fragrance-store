import { CartDrawer } from "@/components/cart-drawer";
import { MobileNav } from "@/components/mobile-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhatsAppButton } from "@/components/whatsapp-button";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <div className="pb-1 lg:hidden" />
      <SiteFooter />
      <CartDrawer />
      <WhatsAppButton />
      <MobileNav />
    </div>
  );
}