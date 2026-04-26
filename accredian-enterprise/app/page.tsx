import { Footer } from "@/components/Footer";
import { Hero } from "@/components/Hero";
import { LeadForm } from "@/components/LeadForm";
import { Navbar } from "@/components/Navbar";
import { Programs } from "@/components/Programs";
import { Solutions } from "@/components/Solutions";
import { TrustedBy } from "@/components/TrustedBy";
import { WhyAccredian } from "@/components/WhyAccredian";

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero />
        <TrustedBy />
        <Solutions />
        <Programs />
        <WhyAccredian />
        <LeadForm />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;
