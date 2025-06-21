import React, { useState } from "react";
import { useNavigate } from "react-router";
import {
  isPasswordValid,
  isEmailValid,
  isDocumentValid,
} from "../services/validations";
import type { RegisterAuctioneerPayload } from "../services/types";
import { registerAuctioner } from "~/services/fetchService";
import { useAuth } from "~/context/authContext";

type auctioneerRegisterProps = {
  className?: string;
};

function AuctionerRegisterFrom({ className }: auctioneerRegisterProps) {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reputation] = useState(100);
  const [phone, setPhone] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [role] = useState(1);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [department, setDepartment] = useState("");
  const [plate, setPlate] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;

    if (
      !form.checkValidity() ||
      !acceptedTerms ||
      !isEmailValid(email) ||
      !isPasswordValid(password) ||
      !isDocumentValid(documentNumber) ||
      !/^09\d{7}$/.test(phone) ||
      !/^\d{5}$/.test(zipCode) ||
      street.trim() === "" ||
      !/^\d{1,4}$/.test(streetNumber.trim()) ||
      department.trim() === ""
    ) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      event.preventDefault();

      setLoading(true);

      if (!acceptedTerms) {
        return;
      }

      const payload: RegisterAuctioneerPayload = {
        firstName,
        lastName,
        email,
        password,
        ci: `${documentNumber}`,
        reputation,
        phone,
        role,
        direction: {
          street,
          streetNumber: parseInt(streetNumber),
          zipCode: parseInt(zipCode),
          department,
        },
        auctioneerDetails: {
          plate: parseInt(plate),
        },
      };

      try {
        const token = await registerAuctioner(payload);
        login(token);
        navigate("/");
      } catch (error: any) {
        console.error("Error al registrar el usuario:", error);
        alert(error.message || "Error al registrar el usuario");
      }
      setLoading(false);
      return;
    }

    setValidated(true);
  };

  return (
    <div className={className}>
      <form
        className={`needs-validation ${
          validated ? "was-validated" : ""
        } bg-[#1B3845] border border-[#59b9e2]/30 rounded-2xl p-8 shadow-xl space-y-6 animate-fade-in duration-500`}
        noValidate
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-[#81fff9] text-center mb-4 font-[Inter]">
          Registro como Subastador
        </h2>

        <div className="bg-[#1B3845] border border-[#59b9e2]/40 rounded-xl p-6 mb-8 shadow-md">
          <h3 className="text-[#81fff9] text-lg font-semibold mb-4">
            Datos personales
          </h3>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="firstName-auctioneer"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Nombre"
                  pattern="^[a-zA-Z]+$"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && firstName.trim() === ""
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="firstName-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Nombre
                </label>
              </div>
              {validated && firstName.trim() === "" ? (
                <div className="text-red-400 text-sm mt-1">
                  Por favor ingrese un nombre ❌
                </div>
              ) : validated && firstName.trim() !== "" ? (
                <div className="text-green-400 text-sm mt-1">
                  Nombre válido ✅
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="text"
                id="lastName-auctioneer"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                pattern="^[a-zA-Z]+$"
                required
                className={`
                  peer block w-full appearance-none rounded-lg border
                  bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                  focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                  ${
                    validated && lastName.trim() === ""
                      ? "border-red-500 shadow-[0_0_10px_#f87171]"
                      : "border-[#59b9e2]/50"
                  }
                `}
              />
              <label
                htmlFor="lastName-auctioneer"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Apellido
              </label>
            </div>
            {validated && lastName.trim() === "" ? (
              <div className="text-red-400 text-sm mt-1">
                Por favor ingrese un apellido ❌
              </div>
            ) : validated && lastName.trim() !== "" ? (
              <div className="text-green-400 text-sm mt-1">
                Apellido válido ✅
              </div>
            ) : null}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="email"
                id="email-auctioneer"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className={`
                  peer block w-full appearance-none rounded-lg border
                  bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                  focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                  ${
                    validated && !isEmailValid(email)
                      ? "border-red-500 shadow-[0_0_10px_#f87171]"
                      : "border-[#59b9e2]/50"
                  }
                `}
              />
              <label
                htmlFor="email-auctioneer"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Email
              </label>
            </div>
            {validated && !isEmailValid(email) ? (
              <div className="text-red-400 text-sm mt-1">
                Por favor ingrese un email válido ❌
              </div>
            ) : validated && isEmailValid(email) ? (
              <div className="text-green-400 text-sm mt-1">Email válido ✅</div>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="password"
                  id="password-auctioneer"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contraseña"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && !isPasswordValid(password)
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="password-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Contraseña
                </label>
              </div>
              {validated && password.trim() !== "" && (
                <>
                  {!isPasswordValid(password) ? (
                    <div className="text-red-400 text-sm mt-1">
                      La contraseña debe tener:
                      <br />• Entre 8 a 20 caracteres ❌
                      <br />• Al menos una letra mayúscula ❌
                      <br />• Al menos una minúscula y un número ❌
                    </div>
                  ) : (
                    <div className="text-green-400 text-sm mt-1">
                      Contraseña válida ✅
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              {/* 
                <select
                  className={
                    `flex form-select border-2 rounded-lg p-1 text-black
                    ${validated && documentType === 'Doc' ? 'border-red-500' : 'border-gray-300'}
                  `}
                  style={{ backgroundColor: 'rgb(168, 175, 234)' }}
                  aria-label="Tipo de documento"
                  required
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="">DOC</option>
                  <option value="ci">CI</option>
                  <option value="pasaport">Pasaporte</option>
                  <option value="dni">DNI</option>
                </select> 
              */}
              <input
                type="text"
                id="document-auctioneer"
                value={documentNumber}
                onChange={(e) => setDocumentNumber(e.target.value)}
                placeholder="Documento"
                required
                className={`
                  peer block w-full appearance-none rounded-lg border
                  bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                  focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                  ${
                    validated && !isDocumentValid(documentNumber)
                      ? "border-red-500 shadow-[0_0_10px_#f87171]"
                      : "border-[#59b9e2]/50"
                  }
                `}
              />
              <label
                htmlFor="document-auctioneer"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Documento
              </label>
            </div>
            {validated && (
              <>
                {!isDocumentValid(documentNumber) ? (
                  <div className="text-red-400 text-sm mt-1">
                    Por favor ingrese un documento válido ❌
                  </div>
                ) : (
                  <div className="text-green-400 text-sm mt-1">
                    Documento válido ✅
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex-1 min-w-[200px]">
            <div className="relative z-0 w-full mb-6 group font-[Inter]">
              <input
                type="text"
                id="phone-auctioneer"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Teléfono"
                pattern="^09\d{7}$"
                required
                className={`
                  peer block w-full appearance-none rounded-lg border
                  bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                  focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                  ${
                    validated && !/^09\d{7}$/.test(phone)
                      ? "border-red-500 shadow-[0_0_10px_#f87171]"
                      : "border-[#59b9e2]/50"
                  }
                `}
              />
              <label
                htmlFor="phone-auctioneer"
                className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                  peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                  peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                  bg-[#1B3845]"
              >
                Teléfono
              </label>
            </div>
            {validated && !/^09\d{7}$/.test(phone) && (
              <div className="text-red-400 text-sm mt-1">
                El teléfono debe tener el formato 09x xxx xxx ❌
              </div>
            )}
            {validated && /^09\d{7}$/.test(phone) && (
              <div className="text-green-400 text-sm mt-1">
                Teléfono válido ✅
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Matrícula */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="plate-auctioneer"
                  value={plate}
                  onChange={(e) => setPlate(e.target.value)}
                  placeholder="Matrícula"
                  pattern="^\d{5}$"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && !/^\d{5}$/.test(plate.trim())
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="plate-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Matrícula
                </label>
              </div>
              {validated &&
                plate.trim() === "" &&
                !/^\d{5}$/.test(plate.trim()) && (
                  <div className="text-red-400 text-sm mt-1">
                    La matrícula no puede estar vacía y debe tener 5 dígitos ❌
                  </div>
                )}
              {validated && /^\d{5}$/.test(plate.trim()) && (
                <div className="text-green-400 text-sm mt-1">
                  Matrícula válida ✅
                </div>
              )}
            </div>

            {/* Departamento */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="department-auctioneer"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Departamento"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && department.trim() === ""
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="department-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Departamento
                </label>
              </div>
              {validated && department.trim() === "" && (
                <div className="text-red-400 text-sm mt-1">
                  Por favor ingrese un departamento válido ❌
                </div>
              )}
              {validated && department.trim() !== "" && (
                <div className="text-green-400 text-sm mt-1">
                  Departamento válido ✅
                </div>
              )}
            </div>

            {/* Código Postal */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="zipCode-auctioneer"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="Código Postal"
                  pattern="^\d{5}$"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && !/^\d{5}$/.test(zipCode)
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="zipCode-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Código Postal
                </label>
              </div>
              {validated && !/^\d{5}$/.test(zipCode) && (
                <div className="text-red-400 text-sm mt-1">
                  El código postal debe tener 5 dígitos ❌
                </div>
              )}
              {validated && /^\d{5}$/.test(zipCode) && (
                <div className="text-green-400 text-sm mt-1">
                  Código postal válido ✅
                </div>
              )}
            </div>

            {/* Calle */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="street-auctioneer"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Calle"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && street.trim() === ""
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="street-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Calle
                </label>
              </div>
              {validated && street.trim() === "" && (
                <div className="text-red-400 text-sm mt-1">
                  Por favor ingrese una calle válida ❌
                </div>
              )}
              {validated && street.trim() !== "" && (
                <div className="text-green-400 text-sm mt-1">
                  Calle válida ✅
                </div>
              )}
            </div>

            {/* Número de Calle */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative z-0 w-full mb-6 group font-[Inter]">
                <input
                  type="text"
                  id="streetNumber-auctioneer"
                  value={streetNumber}
                  onChange={(e) => setStreetNumber(e.target.value)}
                  placeholder="Número"
                  pattern="^\d{1,4}$"
                  required
                  className={`
                    peer block w-full appearance-none rounded-lg border
                    bg-[#1B3845] px-4 pt-5 pb-2 text-sm text-white placeholder-transparent
                    focus:border-[#81fff9] focus:outline-none focus:ring-2 focus:ring-[#81fff9]/50 transition
                    ${
                      validated && !/^\d{1,4}$/.test(streetNumber.trim())
                        ? "border-red-500 shadow-[0_0_10px_#f87171]"
                        : "border-[#59b9e2]/50"
                    }
                  `}
                />
                <label
                  htmlFor="streetNumber-auctioneer"
                  className="absolute left-4 -top-3 z-10 text-sm text-[#81fff9] px-1 transition-all duration-200
                    peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-[#81fff9]/60
                    peer-focus:-top-3 peer-focus:text-sm peer-focus:text-[#81fff9]
                    bg-[#1B3845]"
                >
                  Número
                </label>
              </div>
              {validated && !/^\d{1,4}$/.test(streetNumber.trim()) && (
                <div className="text-red-400 text-sm mt-1">
                  El número de calle no puede tener más de 4 dígitos ❌
                </div>
              )}
              {validated && /^\d{1,4}$/.test(streetNumber.trim()) && (
                <div className="text-green-400 text-sm mt-1">
                  Número válido ✅
                </div>
              )}
            </div>
          </div>

          {/* Términos y condiciones */}
          <div className="form-group flex justify-center items-center mt-4">
            <div className="form-check">
              <input
                className={`form-check-input ${
                  validated && !acceptedTerms ? "is-invalid" : ""
                }`}
                type="checkbox"
                id="invalidCheck-auctioneer"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                required
              />
              <label className="form-check-label p-2" htmlFor="invalidCheck">
                Acepto los términos y condiciones
              </label>
              {validated && !acceptedTerms && (
                <div className="text-red-500 text-sm mt-1">
                  Debes aceptar los términos y condiciones para registrarte ❌
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <button
            className="bg-[#81fff9] text-[#1B3845] font-semibold py-2 px-6 rounded-lg border border-[#81fff9] 
    transition-colors duration-300 hover:bg-[#59b9e2] hover:text-white hover:border-[#59b9e2] shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            type="submit"
            disabled={loading}
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AuctionerRegisterFrom;
