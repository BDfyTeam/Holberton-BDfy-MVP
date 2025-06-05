import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';

<Swiper
  navigation={true}
  modules={[Navigation]}
  className="w-full max-w-3xl mx-auto"
>
  <SwiperSlide>
    <img src="..." alt="Slide 1" className="w-full h-64 object-cover" />
    <div className="absolute bottom-4 left-4 text-white">
      <h5 className="text-lg font-bold">First slide label</h5>
      <p>Some representative placeholder content for the first slide.</p>
    </div>
  </SwiperSlide>
  <SwiperSlide>
    <img src="..." alt="Slide 2" className="w-full h-64 object-cover" />
    <div className="absolute bottom-4 left-4 text-white">
      <h5 className="text-lg font-bold">Second slide label</h5>
      <p>Some representative placeholder content for the second slide.</p>
    </div>
  </SwiperSlide>
</Swiper>
