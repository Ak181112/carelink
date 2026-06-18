import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import FindCaretakersClient from "@/components/caretaker/FindCaretakersClient";

export default function FindCaretakersPage() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-50 min-h-screen">
        <FindCaretakersClient />
      </main>
      <Footer />
    </>
  );
}
