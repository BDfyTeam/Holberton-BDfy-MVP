import type { Route } from "./+types/home";
import { NavBar } from "~/components/navBar";
import UserRegisterForm from "~/components/userRegisterForms";
import AuctionerRegisterFrom from "~/components/auctionerRegisterForm";

import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Registro de usuarios" },
    { name: "description", content: "Se registran Subastadores y usuarios" },
  ];
}



export default function Register() {
  return (
    <main>
      <div>
        <nav className="flex flex-row justify-end space-x-4 p-4 bg-slate-800">
          <NavBar to="/">Inicio</NavBar>
        </nav>
        <div className="w-full max-w-4xl mx-auto">
      <Swiper>
        <SwiperSlide>
          <AuctionerRegisterFrom />
        </SwiperSlide>
        <SwiperSlide>
          <UserRegisterForm />
        </SwiperSlide>
      </Swiper>
    </div>
      </div>
    </main>
  );
}
