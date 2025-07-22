import { useState } from "react"
import { Github, Linkedin, Globe } from "lucide-react"

const translations = {
  es: {
    title: "BDfy",
    subtitle: "Simple y Seguro",
    cta: "Prueba nuestra web",
    img1: "app/public/assets/homePage.png",
    img2: "app/public/assets/misSubastas.png",
    img3: "app/public/assets/inventory.png",
    img4: "app/public/assets/bids.png",
    feature1: "UX irresistiblemente simple",
    feature2: "Sube tu subasta en un pestañeo",
    feature3: "Inventario bajo control total",
    feature4: "Puja, gana y celebra",
    tagline: "El Equipo",
    finalCta: "Todas tus subastas de interés en un mismo lugar",
    footerText: "© 2025 BDfy. Todas las ofertas son bienvenidas.",
    privacy: "Privacidad",
  },
  en: {
    title: "BDfy",
    subtitle: "Simple & Secure",
    cta: "Try our website",
    img1: "app/public/assets/homePage.png",
    img2: "app/public/assets/misSubastas.png",
    img3: "app/public/assets/inventory.png",
    img4: "app/public/assets/bids.png",
    feature1: "UX aprueba de bobos",
    feature2: "Publica tu subasta en menos de lo que gastas el aguinaldo",
    feature3: "Manejo de inventario sin empleados de por medio",
    feature4: "Lo viste, te encantó y lo ganas",
    tagline: "The Team",
    finalCta: "All your favourite auctions in one place",
    footerText: "© 2025 BDfy. All bids welcome.",
    privacy: "Privacy",
  },
}

const teamMembers = [
  {
    name: "Fabrizzio Oviedo",
    role: "PM · DevOps · Frontend",
    github: "https://github.com/Ifabri31",
    linkedin: "https://linkedin.com/in/oviedofabrizzio31",
    avatar: "app/public/assets/fabri.jpg"
  },
  {
    name: "Rodrigo Ferrer",
    role: "Backend · QA",
    github: "https://github.com/rodrigoferrer",
    linkedin: "https://linkedin.com/in/rodrigo-ferrer-742034227",
    avatar: "app/public/assets/rodri.jpg",
  },
  {
    name: "Franco Reyes",
    role: "Frontend · UX · UI",
    github: "https://github.com/Franco-byte",
    linkedin: "https://linkedin.com/in/francoreyesortiz",
    avatar: "app/public/assets/fran.jpg",
  },
  {
    name: "Lucas Andrada",
    role: "Backend · DB",
    github: "https://github.com/lucas2mz",
    linkedin: "https://linkedin.com/in/lucas-andrada2606",
    avatar: "app/public/assets/lucas.jpg",
  },
]

export default function Landing() {
  const [language, setLanguage] = useState<"es" | "en">("es")
  const t = translations[language]
  const toggleLanguage = () =>
    setLanguage(language === "es" ? "en" : "es")

  return (
    <div className="min-h-screen text-gray-900">
      {/* Floating Language Toggle */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-transparent backdrop-blur-sm hover:bg-opacity-10 transition-colors shadow-lg"
        >
          <Globe className="w-4 h-4" />
          <span className="text-sm font-medium">
            {language.toUpperCase()}
          </span>
        </button>
      </div>

      {/* Hero Section centered */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 pt-25 pb-20 text-center">
        <h1 className="text-5xl lg:text-6xl font-bold mb-6 text-[#0D4F61]">
          {t.title}
        </h1>
        <p className="text-2xl lg:text-3xl text-[#3E7483] mb-8 font-light">
          {t.subtitle}
        </p>
        <a
          href="https://bdfy.tech"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block bg-[#0D4F61] hover:bg-[#0E445A] text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
        >
          {t.cta}
        </a>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <hr className="border-gray-200" />
      </div>

      {/* Key Benefits */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid md:grid-cols-1 gap-12">
          {[t.feature1].map((text, i) => (
            <div key={i} className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-1/2">
                <h3 className="text-4xl font-semibold mb-4 text-[#0D4F61]">
                  {text}
                </h3>
              </div>
              <div className="md:w-1/2">
                <img
                  src={t.img1}
                  alt={t.feature1}
                  className="w-full max-w-[600px] rounded-2xl shadow-lg"
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature 2 - texto derecha, imagen izquierda */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h3 className="text-4xl font-semibold mb-4 text-[#0D4F61]">
              {t.feature2}
            </h3>
          </div>
          <div className="md:w-1/2">
            <img
              src={t.img2}
              alt={t.feature2}
              className="w-full max-w-[600px] rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Feature 3 - texto izquierda, imagen derecha */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h3 className="text-4xl font-semibold mb-4 items-center text-[#0D4F61]">
              {t.feature3}
            </h3>
          </div>
          <div className="md:w-1/2">
            <img
              src={t.img3}
              alt={t.feature3}
              className="w-full max-w-[600px] h-70 rounded-2xl shadow-lg items-right "
            />
          </div>
        </div>
      </section>

      {/* Feature 4 - texto derecha, imagen izquierda */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-12">
          <div className="md:w-1/2">
            <h3 className="text-4xl font-semibold mb-4 text-[#0D4F61]">
              {t.feature4}
            </h3>
          </div>
          <div className="md:w-1/2">
            <img
              src={t.img4}
              alt={t.feature4}
              className="w-full max-w-[600px] rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <hr className="border-gray-200" />
      </div>

      {/* Eye-candy Tagline */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <h2 className="text-4xl lg:text-6xl font-bold text-[#0D4F61] text-center">
          {t.tagline}
        </h2>
      </section>

      {/* Divider */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <hr className="border-gray-200" />
      </div>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 lg:px-8 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {teamMembers.map((member, idx) => (
            <div key={idx} className="text-center">
              <div className="w-24 h-24 bg-[#D3E3EB] rounded-full mx-auto mb-4 flex items-center justify-center">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-30 h-30 rounded-full object-cover"
                />
              </div>
              <h3 className="font-semibold text-lg mb-2 text-[#0D4F61]">
                {member.name}
              </h3>
              <p className="text-sm text-[#3E7483] mb-4">
                {member.role}
              </p>
              <div className="flex justify-center gap-3">
                <a
                  href={member.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                >
                  <Github className="w-8 h-8" />
                </a>
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg hover:bg-opacity-10 transition-colors"
                >
                  <Linkedin className="w-8 h-8" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA Banner */}
      <section className="bg-[#D3E3EB] py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-[#0D4F61]">
            {t.finalCta}
          </h2>
          <a
            href="https://bdfy.tech"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-[#0D4F61] hover:bg-[#0E445A] text-white px-8 py-4 rounded-lg text-lg font-medium transition-colors shadow-lg hover:shadow-xl"
          >
            {t.cta}
          </a>
        </div>
      </section>
    </div>
  )
}
