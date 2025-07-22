import { useState } from "react";
import { Facebook, Youtube, Twitter, Instagram } from "lucide-react";

interface Props {
  className?: string;
}

export default function Footer({ className }: Props) {
  const [selectedLanguage, setSelectedLanguage] = useState("es");

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
  };

  return (
    <footer className={`${className} bg-[#0D4F61] text-white`}>
      <div className="container mx-auto px-6 py-10">
        {/* Grid principal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {/* Navegación */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Navegación</h3>
            <ul>
              <li><a href="/home" className="hover:text-gray-300 transition">Inicio</a></li>
              <li><a href="/galery" className="hover:text-gray-300 transition">Explorar subastas</a></li>
              <li><a href="/support" className="hover:text-gray-300 transition">Soporte</a></li>
            </ul>
          </div>

          {/* Contacto y redes */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Contáctanos</h3>
            <ul>
              <li><a href="#" className="hover:text-gray-300 transition"><Facebook className="inline mr-1" /> Facebook</a></li>
              <li><a href="#" className="hover:text-gray-300 transition"><Youtube className="inline mr-1" /> YouTube</a></li>
              <li><a href="#" className="hover:text-gray-300 transition"><Twitter className="inline mr-1" /> Twitter</a></li>
              <li><a href="#" className="hover:text-gray-300 transition"><Instagram className="inline mr-1" /> Instagram</a></li>
              <li><a href="https://github.com/BDfyTeam/Holberton-BDfy-MVP" className="hover:text-gray-300 transition ml-6">GitHub</a></li>
            </ul>
          </div>

          {/* BDfy info */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">BDfy</h3>
            <ul>
              <li><a href="/about" className="hover:text-gray-300 transition">Sobre nosotros</a></li>
              <li><a href="/terms" className="hover:text-gray-300 transition">Términos de uso</a></li>
              <li><a href="/privacy-policy" className="hover:text-gray-300 transition">Políticas de privacidad</a></li>
              <li><a href="/how-to-create-auction" className="hover:text-gray-300 transition">¿Cómo creo una subasta?</a></li>
              <li><a href="/how-to-participate" className="hover:text-gray-300 transition">¿Cómo participo?</a></li>
              <li><a href="/faq" className="hover:text-gray-300 transition">Preguntas frecuentes</a></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h3 className="font-semibold text-2xl mb-4">Cuenta</h3>
            <ul>
              <li><a href="/login" className="hover:text-gray-300 transition">Iniciar sesión</a></li>
              <li><a href="/register" className="hover:text-gray-300 transition">Crear cuenta</a></li>
            </ul>
          </div>
        </div>

        {/* Separador */}
        <div className="border-t border-white/30 my-8"></div>

        {/* Info final */}
        <div className="text-center text-sm space-y-4">
          <p>© 2025 BDfy. Todos los derechos reservados.</p>
          <p>
            BDfy está comprometido con ofrecer una experiencia de subastas segura y transparente. 
            Conoce más sobre cómo puedes beneficiarte al unirte a nuestra plataforma.
          </p>
        </div>
      </div>
    </footer>
  );
}
