import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import { es } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import { CustomInput } from "~/services/DeleteAutocompleteModal";

type DateFieldsProps = {
  startAt: Date | null;
  endAt: Date | null;
  setStartAt: (date: Date | null) => void;
  setEndAt: (date: Date | null) => void;
  className?: string;
};

export function formatDate(date: Date | null) {
  if (!date) return "";

  const weekday = new Intl.DateTimeFormat("es-ES", { weekday: "long" }).format(
    date
  );
  const day = new Intl.DateTimeFormat("es-ES", { day: "2-digit" }).format(date);
  const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(
    date
  );
  const time = new Intl.DateTimeFormat("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

  return `${weekday} ${day} de ${month} - ${time} hrs`;
}

export default function DateFields({
  className,
  startAt,
  endAt,
  setStartAt,
  setEndAt,
}: DateFieldsProps) {
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  return (
    <div className={className}>
      {/* Fecha de inicio */}
      <div className="w-1/2 z-60 relative">
        <DatePicker
          selected={startAt}
          onChange={(date) => setStartAt(date)}
          onCalendarOpen={() => setIsStartOpen(true)}
          onCalendarClose={() => setIsStartOpen(false)}
          showTimeSelect
          minDate={new Date()}
          maxDate={endAt ? new Date(endAt.getTime() - 1) : undefined}
          dateFormat="Pp"
          wrapperClassName="w-full"
          popperClassName="z-50 !w-auto !min-w-96"
          popperPlacement="bottom-start"
          locale={es}
          customInput={<CustomInput id="startAt" value={formatDate(startAt)} />}
        />
        <label
          htmlFor="startAt"
          className={`absolute left-3 transition-all duration-200 bg-[#D3E3EB] px-1
              text-lg text-[#8a8989]
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-lg 
              peer-focus:top-[-12px] peer-focus:text-xs peer-focus:text-[#41c4ae]
              ${
                startAt || isStartOpen
                  ? "top-[-12px] text-xs text-[#41c4ae]"
                  : "top-2 text-lg text-[#8a8989]"
              }
`}
        >
          Fecha de inicio
        </label>
      </div>

      {/* Fecha de fin */}
      <div className="w-1/2 z-60 relative">
        <DatePicker
          selected={endAt}
          onChange={(date) => setEndAt(date)}
          onCalendarOpen={() => setIsEndOpen(true)}
          onCalendarClose={() => setIsEndOpen(false)}
          showTimeSelect
          minDate={startAt ? startAt : new Date()}
          dateFormat="Pp"
          wrapperClassName="w-full"
          popperClassName="z-50 !w-auto !min-w-96"
          popperPlacement="bottom-end"
          locale={es}
          customInput={<CustomInput id="endAt" value={formatDate(endAt)} />}
        />
        <label
          htmlFor="endAt"
          className={`absolute left-3 transition-all duration-200 bg-[#D3E3EB] px-1
              text-lg text-[#8a8989]
              peer-placeholder-shown:top-2 peer-placeholder-shown:text-lg 
              peer-focus:top-[-12px] peer-focus:text-xs peer-focus:text-[#41c4ae]
              ${
                endAt || isEndOpen
                  ? "top-[-12px] text-xs text-[#41c4ae]"
                  : "top-2 text-lg text-[#8a8989]"
              }`}
        >
          Fecha de fin
        </label>
      </div>
    </div>
  );
}
