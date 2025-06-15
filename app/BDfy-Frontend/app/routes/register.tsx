import type { Route } from "./+types/home";
import UserRegisterForm from "~/components/userRegisterForms";
import AuctionerRegisterFrom from "~/components/auctionerRegisterForm";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import CreateAuctionButton from "~/components/auctionForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro de usuarios" },
    { name: "description", content: "Se registran Subastadores y usuarios" },
  ];
}

export default function Register() {
  return (
    <main>
      <div className="w-full max-w-4xl mx-auto">
        <Swiper
          spaceBetween={50}
          slidesPerView={1}
          pagination={{ clickable: true }}
          navigation
          className="my-8"
          loop
        >
          <SwiperSlide key="auctioneer">
            <AuctionerRegisterFrom />
          </SwiperSlide>
          <SwiperSlide key="user">
            <UserRegisterForm />
          </SwiperSlide>
        </Swiper>
      </div>
    </main>
  );
}
