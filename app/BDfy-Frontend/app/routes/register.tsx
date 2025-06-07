import type { Route } from "./+types/home";
import UserRegisterForm from "~/components/userRegisterForms";
import AuctionerRegisterFrom from "~/components/auctionerRegisterForm";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

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
          <div>
            <SwiperSlide>
              <AuctionerRegisterFrom />
            </SwiperSlide>
          </div>
          <div>
            <SwiperSlide>
              <UserRegisterForm />
            </SwiperSlide>
          </div>
        </Swiper>
      </div>
    </main>
  );
}
