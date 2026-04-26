import { companyLogos } from "@/lib/mockData";

export const TrustedBy = () => {
  const scrollingLogos = [...companyLogos, ...companyLogos];

  return (
    <section className="section-shell border-b border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <h2 className="section-heading">Trusted by Leading Enterprises</h2>
          <p className="section-copy mx-auto">
            Global organizations choose Accredian to accelerate digital transformation, leadership growth, and cross-functional upskilling.
          </p>
        </div>

        <div className="mt-12 overflow-hidden">
          <div className="marquee-track flex animate-marquee gap-4">
            {scrollingLogos.map((logo, index) => (
              <div
                key={`${logo.name}-${index}`}
                className="flex min-w-[180px] items-center justify-center rounded-2xl border border-gray-200 bg-white px-6 py-5 text-sm font-semibold text-gray-500 shadow-sm"
              >
                {logo.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
