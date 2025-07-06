import { useState } from "react";
import { Mail, Facebook, Youtube, Twitter, Instagram, Phone } from "lucide-react";

interface Props {
  className?: string;
}

export default function Footer({ className }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <footer className={className}>
      <div className="container mx-auto px-6">
        {/* Sección de columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Navegación */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Navegación</h3>
            <ul>
              <li>
                <a href="/home" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  Inicio
                </a>
              </li>
              <li>
                <a href="/galery" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  Explorar subastas
                </a>
              </li>
              <li>
                <a href="/support" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  Soporte
                </a>
              </li>
            </ul>
          </div>

          {/* Contacta con nosotros */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">
              Contacta con nosotros
            </h3>
            <ul>
              <li>
                <a
                  href="mailto:bdfycontacto@bdfy.com"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  <Mail className="inline mr-0.5" /> bdfycontacto@bdfy.com
                </a>
              </li>
              <li>
                <a href="https://www.facebook.com/BDfy" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  <Facebook className="inline mr-0.5" /> Facebook
                </a>
              </li>
              <li>
                <a href="https://www.youtube.com/BDfy" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  <Youtube className="inline mr-0.5" /> Youtube
                </a>
              </li>
              <li>
                <a href="https://www.twitter.com/BDfy" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  <Twitter className="inline mr-0.5" /> Twitter
                </a>
              </li>
              <li>
                <a href="https://www.instagram.com/BDfy" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  <Instagram className="inline mr-0.5" /> Instagram
                </a>
              </li>
              <li>
                <a href="tel:+123456789" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  <Phone className="inline mr-0.5" /> 098 933 325
                </a>
              </li>
            </ul>
          </div>

          {/* Acerca de BDfy */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">BDfy</h3>
              <ul>
              <li>
                <a
                  href="/about"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  Sobre nosotros
                </a>
              </li>
              <li>
                <a
                  href="/terms"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  Términos de uso
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  Políticas de privacidad
                </a>
              </li>
              <li>
                <a
                  href="/how-to-create-auction"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  ¿Cómo creo una subasta?
                </a>
              </li>
              <li>
                <a
                  href="/how-to-participate"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  ¿Cómo participo en una subasta?
                </a>
              </li>
              <li>
                <a
                  href="/faq"
                  className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300"
                >
                  Preguntas frecuentes
                </a>
              </li>
              </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Cuenta</h3>
            <ul>
              <li>
                <a href="/login" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  Iniciar sesión
                </a>
              </li>
              <li>
                <a href="/register" className="hover:drop-shadow-[0_0_6px_#ffffff] hover:text-white transition duration-300">
                  Crear cuenta
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-white-600 my-8"></div>

        {/* Información de derechos de autor y selector de idioma */}
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div className="text-xl">
            <p>© 2025 BDfy. Todos los derechos reservados.</p>
          </div>

          <div className="flex items-center mt-4 sm:mt-0">
            <select
              id="language"
              value={selectedLanguage}
              onChange={handleLanguageChange}
              className="bg-[#0D4F61] hover:text-white  text-xl p-2 hover:bg-[#0D4F61] transition duration-300"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-white-600 my-8"></div>

        {/* Acerca de BDfy (textos informativos adicionales) */}
        <div className="mt-8 text-center">
          <p className="text-sm">
            BDfy está comprometido con ofrecer una experiencia de subastas
            segura y transparente. Conoce más sobre cómo puedes beneficiarte al
            unirte a nuestra plataforma.
          </p>
        </div>
      </div>
    </footer>
  );
}
