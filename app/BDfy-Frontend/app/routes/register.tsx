import type { Route } from "./+types/home";
import UserRegisterForm from "~/components/userRegisterForms";
import AuctionerRegisterFrom from "~/components/auctionerRegisterForm";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PostUser from "~/components/PostUser";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro de usuarios" },
    { name: "description", content: "Se registran Subastadores y usuarios" },
  ];
}

export default function Register() {
  return (
    <main>
      <div className="w-full max-w-4xl mx-auto bg-[#59b9e2]/10 rounded-xl shadow-xl p-8 relative border border-[#6cf2ff]/50 transition-colors duration-300 hover:border-[#81fff9] hover:drop-shadow-[0_0_6px_#59b9e2]">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
          loop
          speed={600}
          centeredSlides
          autoHeight
          pagination={{
            clickable: true,
          }}
          navigation={{
            nextEl: ".swiper-button-next",
            prevEl: ".swiper-button-prev",
          }}
          className="my-12 rounded-xl overflow-hidden"
        >
          <SwiperSlide key="auctioneer">
            <div className="p-6 sm:p-8 max-w-2xl mx-auto animate-fade-in duration-500">
              <AuctionerRegisterFrom className="bg-[#0f1e25] p-6 rounded-lg shadow-lg border border-[#59b9e2]/30" />
            </div>
          </SwiperSlide>
          <SwiperSlide key="user">
            <div className="p-6 sm:p-8 max-w-2xl mx-auto animate-fade-in duration-500">
              <UserRegisterForm className="bg-[#0f1e25] p-6 rounded-lg shadow-lg border border-[#59b9e2]/30" />
            </div>
          </SwiperSlide>
        </Swiper>

        {/* Botones personalizados con íconos */}
        <div className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-50 cursor-pointer text-[#81fff9] hover:text-white transition">
          <ChevronLeft size={32} />
        </div>
        <div className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-50 cursor-pointer text-[#81fff9] hover:text-white transition">
          <ChevronRight size={32} />
        </div>
      </div>
        <PostUser />
    </main>
  );
}
