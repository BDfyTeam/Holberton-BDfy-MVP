import type { Route } from "./+types/home";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import PostUser from "~/components/PostUser";
import PostAuctioneer from "~/components/PostAuctioneer";
import { useState } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro de usuarios" },
    { name: "description", content: "Se registran Subastadores y usuarios" },
  ];
}

export default function Register() {
  const [showAuctioneer, setShowAuctioneer] = useState(true);


  return (
    <main>
      <div className="w-4/5 h-auto mt-22 mb-3 mx-auto">
        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={50}
          slidesPerView={1}
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
          className="flex h-auto rounded-xl overflow-visible"
        >
          <SwiperSlide key="auctioneer">
            {/* Registro como subastador */}
            <PostAuctioneer
              className="flex w-5/6 mx-auto mb-10 bg-[#0D4F61] rounded-2xl shadow-lg
              shadow-gray-700 p-2 relative overflow-visible"
            />

            {/* Boton hacia registro oferente */}
            <div className="swiper-button-next absolute right-2 top-1/2 -translate-y-1/2 z-50 cursor-pointer text-[#81fff9] hover:text-white transition">
              <ChevronRight size={32} />
            </div>
          </SwiperSlide>

          <SwiperSlide key="user">
            {/* Registro como oferente */}
            <PostUser
              className="flex w-5/6 mx-auto mb-10 bg-[#0D4F61] rounded-2xl shadow-lg
              shadow-gray-700 p-2 relative overflow-visible"
            />

            {/* Boton hacia registro de subastador */}
            <div className="swiper-button-prev absolute left-2 top-1/2 -translate-y-1/2 z-50 cursor-pointer text-[#81fff9] hover:text-white transition">
              <ChevronLeft size={32} />
            </div>
          </SwiperSlide>
        </Swiper>
      </div>
    </main>
  );
}
