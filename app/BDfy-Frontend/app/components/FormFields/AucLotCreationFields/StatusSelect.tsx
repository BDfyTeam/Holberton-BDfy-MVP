import {
    Combobox,
    ComboboxInput,
    ComboboxButton,
    ComboboxOptions,
    ComboboxOption,
  } from "@headlessui/react";
  import { ChevronDownIcon } from "@heroicons/react/20/solid";
  import { CheckIcon } from "lucide-react";
  import clsx from "clsx";
  
  type StatusOption = {
    id: number;
    name: string;
  };
  
  const statusOptions: StatusOption[] = [
    { id: 1, name: "Activo" },
    { id: 2, name: "Borrador" },
  ];
  
  type Props = {
    status: number;
    setStatus: (status: number) => void;
    className?: string;
  };
  
  export default function StatusField({ status, setStatus, className }: Props) {
    const selectedOption = statusOptions.find((opt) => opt.id === status);
  
    return (
      <div className={className}>
        <Combobox value={selectedOption} onChange={(opt) => opt && setStatus(opt.id)}>
          <div className="relative">
            <ComboboxInput
              id="status"
              displayValue={(opt: StatusOption) => opt.name}
              className="peer w-full px-4 py-2 bg-[#D3E3EB] border-b-2 border-[#0D4F61] focus:outline-none 
                focus:border-[#41c4ae] text-[#0D4F61] placeholder-transparent text-sm"
              placeholder=" "
              readOnly
            />
  
            <label
              htmlFor="status"
              className="absolute left-3 top-2 text-[#0D4F61] text-lg transition-all 
                peer-placeholder-shown:top-0 peer-placeholder-shown:text-[#8a8989] 
                peer-focus:top-[-12px] peer-focus:text-[#41c4ae] peer-focus:text-xs 
                peer-not-placeholder-shown:top-[-12px] peer-not-placeholder-shown:text-[#0D4F61] 
                peer-not-placeholder-shown:text-xs"
            >
              Estado
            </label>
  
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownIcon className="w-4 h-4 text-[#0D4F61]" />
            </ComboboxButton>
          </div>
  
          <ComboboxOptions
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto 
              rounded-lg bg-[#D3E3EB] border border-[#0D4F61] py-1 text-sm shadow-lg"
          >
            {statusOptions.map((option) => (
              <ComboboxOption
                key={option.id}
                value={option}
                className={({ active, selected }) =>
                  clsx(
                    "cursor-pointer select-none px-4 py-2",
                    active && "bg-[#0D4F61]/20",
                    selected && "bg-[#41c4ae]/30 font-semibold text-[#0D4F61]"
                  )
                }
              >
                {({ selected }) => (
                  <div className="flex items-center gap-2">
                    <CheckIcon
                      className={clsx(
                        "w-4 h-4",
                        selected ? "visible text-[#0D4F61]" : "invisible"
                      )}
                    />
                    {option.name}
                  </div>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </Combobox>
      </div>
    );
  }
  