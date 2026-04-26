export const programs = [
  {
    title: "Advanced Data Science Accelerator",
    domain: "Data Science",
    duration: "24 Weeks",
    level: "Intermediate"
  },
  {
    title: "AI for Business Transformation",
    domain: "Artificial Intelligence",
    duration: "16 Weeks",
    level: "Leadership"
  },
  {
    title: "Full Stack Product Management",
    domain: "Product",
    duration: "20 Weeks",
    level: "Intermediate"
  },
  {
    title: "Cloud & DevOps Capability Track",
    domain: "Cloud",
    duration: "18 Weeks",
    level: "Advanced"
  },
  {
    title: "Modern Cybersecurity Readiness",
    domain: "Cybersecurity",
    duration: "14 Weeks",
    level: "Intermediate"
  },
  {
    title: "Leadership for High-Growth Teams",
    domain: "Leadership",
    duration: "12 Weeks",
    level: "Manager"
  }
] as const;

export const solutions = [
  {
    title: "Custom Learning Paths",
    description: "Role-aligned pathways tailored to your business priorities, existing capability gaps, and promotion frameworks.",
    icon: "custom"
  },
  {
    title: "Live Mentorship",
    description: "Industry practitioners guide learners with live doubt-solving sessions, project reviews, and office hours.",
    icon: "mentorship"
  },
  {
    title: "Industry Certifications",
    description: "Programs culminate in high-signal outcomes and certifications that reinforce enterprise readiness and motivation.",
    icon: "certification"
  },
  {
    title: "Analytics Dashboard",
    description: "Track enrollment, attendance, completion, engagement, and business-facing learning insights in one place.",
    icon: "analytics"
  }
] as const;

export const companyLogos = [
  { name: "NovaTech" },
  { name: "Finverse" },
  { name: "BrightGrid" },
  { name: "CloudArc" },
  { name: "Astra Retail" },
  { name: "PeopleFlow" },
  { name: "VisionWare" },
  { name: "ScaleBridge" },
  { name: "Summit Health" },
  { name: "Orion Mobility" }
] as const;

export const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "#" },
      { label: "Leadership", href: "#" },
      { label: "Careers", href: "#" }
    ]
  },
  {
    title: "Solutions",
    links: [
      { label: "Enterprise Programs", href: "#programs" },
      { label: "Custom Academies", href: "#solutions" },
      { label: "Mentorship", href: "#why-accredian" }
    ]
  },
  {
    title: "Resources",
    links: [
      { label: "Case Studies", href: "#" },
      { label: "Insights", href: "#" },
      { label: "Playbooks", href: "#" }
    ]
  },
  {
    title: "Contact",
    links: [
      { label: "sales@accredian.com", href: "mailto:sales@accredian.com" },
      { label: "+91 99999 99999", href: "tel:+919999999999" },
      { label: "Request a Demo", href: "#lead-form" }
    ]
  }
] as const;
