import Footer from "@/components/section/Footer";
import Header from "@/components/section/Header";
import SubscriptionSync from "@/components/atom/SubscriptionSync";

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e10] text-white">
      {/* Global subscription status synchronizer */}
      <SubscriptionSync />

      {/* Fixed header (layout decides its position & height) */}
      <header className="fixed top-0 left-0 w-full h-16 border-b border-gray-800 z-50 bg-[#0d0e10]/90 backdrop-blur-md">
        <Header />
      </header>

      {/* Main content area below fixed header */}
      <main className="flex-1 pt-16">
        {" "}
        {/* <-- pt = height of header */}
        {children}
      </main>

      {/* Footer stays at bottom */}
      <footer className="border-t border-gray-800">
        <Footer />
      </footer>
    </div>
  );
}
