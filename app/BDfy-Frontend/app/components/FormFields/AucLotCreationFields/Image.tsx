import { ImageMinus, ImagePlus } from "lucide-react";

type ImageProps = {
  className?: string;
  image: File | null;
  setImage: (value: File | null) => void;
};

export default function Image({ className, image, setImage }: ImageProps) {
  return (
    <div className={`relative ${className}`}>
      <input
        type="file"
        accept="image/*"
        id="image"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            setImage(e.target.files[0]);
          } else {
            setImage(null);
          }
        }}
        className="hidden"
      />

      <label
        htmlFor="image"
        className="relative block w-full p-4 bg-[#D3E3EB] border-b-2 border-[#0D4F61] 
          text-[#0D4F61] cursor-pointer transition-all 
          hover:border-[#41c4ae] focus-within:border-[#41c4ae]"
      >
        {/* Ícono posicionado al centro verticalmente */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 z-10">
          {!image ? (
            <ImagePlus className="w-10 h-10 text-[#0D4F61] hover:text-[#41c4ae] transition" />
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault(); // Evita activar el input
                setImage(null);
              }}
              className="text-[#e53935] hover:text-[#a11717] transition"
            >
              <ImageMinus className="w-10 h-10" />
            </button>
          )}
        </div>

        {image && (
          <span className="block text-xs text-[#41c4ae] mb-1 text-center">
            Imagen para portada
          </span>
        )}

        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt="Preview"
            className="mt-2 max-h-25 rounded-md object-contain border border-[#41c4ae] block mx-auto"
          />
        )}

        <span
          className={`block ${
            image
              ? "text-sm text-[#0D4F61] text-center mt-2"
              : "text-lg text-[#8a8989]"
          } transition-all`}
        >
          {image ? image.name : "Agregar imagen para portada"}
        </span>
      </label>
    </div>
  );
}
