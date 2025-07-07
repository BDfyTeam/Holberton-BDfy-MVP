type DirectionProps = {
    className?: string;
    street: string;
    streetNumber: string;
    corner: string;
    zipCode: string
    department: string
    setStreet: (value: string) => void;
    setStreetNumber:  (value: string) => void;
    setCorner:  (value: string) => void;
    setZipCode:  (value: string) => void;
    setDepartment:  (value: string) => void;
}


export default function Direction({ 
    className,
    street,
    streetNumber,
    corner,
    zipCode,
    department,
    setStreet,
    setStreetNumber,
    setCorner,
    setZipCode,
    setDepartment
 }: DirectionProps) {
    return (
        <>
        <div>
            {/* calle */}
            <div>
              <input
                type="text"
                id="userStreet"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Calle"
                required
                className="peer block w-1/4 appearance-none rounded-lg border
                  bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                    placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                    focus:ring-2 focus:ring-[#81fff9]/50 transition"
              />
              <label
                htmlFor="userStreet"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Calle
              </label>
            </div>
            {/* Numero de calle */}
            <div>
              <input
                type="text"
                id="userStreetNumber"
                value={streetNumber}
                onChange={(e) => setStreetNumber(e.target.value)}
                placeholder="Número de calle"
                required
                className="peer block w-1/4 appearance-none rounded-lg border
                  bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                  placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                  focus:ring-2 focus:ring-[#81fff9]/50 transition"
              />
              <label
                htmlFor="userStreetNumber"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Número de calle
              </label>
            </div>
            {/* Esquina */}
            <div>
              <input
                type="text"
                id="userCorner"
                value={corner}
                onChange={(e) => setCorner(e.target.value)}
                placeholder="Esquina"
                required
                className="peer block w-1/4 appearance-none rounded-lg border
                  bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                  placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                  focus:ring-2 focus:ring-[#81fff9]/50 transition"
              />
              <label
                htmlFor="userCorner"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Esquina
              </label>
            </div>
          </div>
          <div>
            <div>
              <input
                type="text"
                id="userZipCode"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                placeholder="Código postal"
                required
                className="peer block w-1/4 appearance-none rounded-lg border
                  bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                  placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                  focus:ring-2 focus:ring-[#81fff9]/50 transition"
              />
              <label
                htmlFor="userZipCode"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Código postal
              </label>
            </div>
            <div>
              <input
                type="text"
                id="userDepartment"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Departamento"
                required
                className="peer block w-1/4 appearance-none rounded-lg border
                  bg-[#0D4F61] px-4 pt-5 pb-2 text-sm text-white 
                  placeholder-transparentfocus:border-[#81fff9] focus:outline-none 
                  focus:ring-2 focus:ring-[#81fff9]/50 transition"
              />
              <label
                htmlFor="userDepartment"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Departamento
              </label>
            </div>
          </div>
        </>
    );
}