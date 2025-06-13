import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  isPasswordValid,
  isEmailValid,
  isDocumentValid,
} from "../services/validations";
import type { RegisterUserPayload } from "../services/types";
import { registerUser } from "~/services/fetchService";

function UserRegisterForm() {
  const navigate = useNavigate();
  const [validated, setValidated] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [reputation] = useState(75);
  const [phone, setPhone] = useState("");
  const [documentNumber, setDocumentNumber] = useState("");
  const [role] = useState(0);
  const [street, setStreet] = useState("");
  const [streetNumber, setStreetNumber] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [department, setDepartment] = useState("");
  const [isAdmin] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);

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

      const payload: RegisterUserPayload = {
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
        details: {
          IsAdmin: isAdmin,
        },
      };

      try {
        const token = await registerUser(payload);
        localStorage.setItem("token", token);
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
    <form
      className={`needs-validation ${
        validated ? "was-validated" : ""
      } border-2 border-gray-300 rounded-lg p-6`}
      style={{ backgroundColor: "rgb(60, 63, 96)" }}
      noValidate
      onSubmit={handleSubmit}
    >
      <h1>Registrarme como usuario</h1>
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="firstName">Nombre</label>
          <input
            type="text"
            className={`
              form-control border-2 rounded-lg p-1 w-full text-black
              ${
                validated && firstName.trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Compacto"
            pattern="^[a-zA-Z]+$"
            required
          />
          {validated && firstName.trim() === "" ? (
            <div className="text-red-500 text-sm mt-1">
              Por favor ingrese un nombre ❌
            </div>
          ) : validated && firstName.trim() !== "" ? (
            <div className="text-green-500 text-sm mt-1">Nombre valido ✅</div>
          ) : null}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="lastName">Apellido</label>
          <input
            type="text"
            className={`
              form-control border-2 rounded-lg p-1 w-full text-black
              ${
                validated && lastName.trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Andrada"
            pattern="^[a-zA-Z]+$"
            required
          />
          {validated && lastName.trim() === "" ? (
            <div className="text-red-500 text-sm mt-1">
              Por favor ingrese un apellido ❌
            </div>
          ) : validated && lastName.trim() !== "" ? (
            <div className="text-green-500 text-sm mt-1">
              Apellido valido ✅
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="email" className="block text-white mb-1">
            Email
          </label>
          <input
            type="email"
            className={`
              form-control border-2 rounded-lg p-1 w-full text-black
              ${
                validated && email.trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
            placeholder="mail@example.com"
            required
          />
          {validated && !isEmailValid(email) ? (
            <div className="text-red-500 text-sm mt-1">
              Por favor ingrese un email válido ❌
            </div>
          ) : validated && isEmailValid(email) ? (
            <div className="text-green-500 text-sm mt-1">Email válido ✅</div>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            className={`
              form-control border-2 rounded-lg p-1 w-full text-black
              ${
                validated && !isPasswordValid(password)
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="MotoCompacto123"
            required
          />
          {validated && password.trim() !== "" && (
            <>
              {!isPasswordValid(password) ? (
                <div className="text-red-500 text-sm mt-1">
                  La contraseña debe tener entre 8 a 20 caracteres ❌<br />
                  Al menos una letra mayúscula ❌<br />
                  Al menos una letra minúscula y al menos un número ❌
                </div>
              ) : (
                <div className="text-green-500 text-sm mt-1">
                  Contraseña válida ✅
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="document" className="text-white">
            Documento
          </label>{" "}
          <br />
          <div className="flex space-x-2">
            {/* <select
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
            </select> */}

            <input
              type="text"
              className={`
                flex form-control border-2 rounded-lg p-1 text-black
                ${
                  validated && !isDocumentValid(documentNumber)
                    ? "border-red-500"
                    : "border-gray-300"
                }
              `}
              style={{ backgroundColor: "rgb(168, 175, 234)" }}
              id="document"
              placeholder="1.234.567-8"
              required
              value={documentNumber}
              onChange={(e) => setDocumentNumber(e.target.value)}
            />
          </div>
          {validated && (
            <>
              {!isDocumentValid(documentNumber) ? (
                <div className="text-red-500 text-sm mt-1">
                  Por favor ingrese un documento válido ❌
                </div>
              ) : (
                <div className="text-green-500 text-sm mt-1">
                  Documento válido ✅
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="phone">Telefono</label>
          <input
            type="text"
            className={`
              flex form-control border-2 rounded-lg p-1 text-black
              ${
                validated && !/^09\d{7}$/.test(phone)
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="09xxxxxxx"
            pattern="^09\d{7}$"
            required
          />
          {validated && !/^09\d{7}$/.test(phone) && (
            <div className="invalid-feedback w-full text-red-500 mt-1">
              El teléfono debe tener el formato 09x xxx xxx ❌
            </div>
          )}
          {validated && /^09\d{7}$/.test(phone) && (
            <div className="text-green-500 text-sm mt-1">
              Teléfono válido ✅
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="departament">Departamento</label>
          <input
            type="text"
            className={`
              flex form-control border-2 border-gray-300 rounded-lg p-1 text-black
              ${
                validated && department.trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="department"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="Montevideo"
            required
          />
        </div>
        {validated && department.trim() === "" && (
          <div className="invalid-feedback w-full text-red-500 mt-1">
            Por favor ingrese un departamento válido ❌
          </div>
        )}
        {validated && department.trim() !== "" && (
          <div className="valid-feedback w-full text-green-600 mt-1">
            Departamento válido ✅
          </div>
        )}

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="zipCode">Codigo Postal</label>
          <input
            type="text"
            className={`
              flex form-control border-2 rounded-lg p-1 text-black
              ${
                validated && !/^\d{5}$/.test(zipCode)
                  ? "border-red-500"
                  : validated && /^\d{5}$/.test(zipCode)
                  ? "border-green-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="zipCode"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            placeholder="11200"
            pattern="^\d{5}$"
            required
          />
          {validated && !/^\d{5}$/.test(zipCode) && (
            <div className="invalid-feedback w-full text-red-500 mt-1">
              El código postal debe tener 5 dígitos ❌
            </div>
          )}
          {validated && /^\d{5}$/.test(zipCode) && (
            <div className="valid-feedback w-full text-green-600 mt-1">
              Código postal válido ✅
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="street">Calle</label>
          <input
            type="text"
            className={`
              flex form-control border-2 border-gray-300 rounded-lg p-1 text-black
              ${
                validated && street.trim() === ""
                  ? "border-red-500"
                  : "border-gray-300"
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="street"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="Av. CuloRoto"
            required
          />
          {validated && street.trim() === "" && (
            <div className="invalid-feedback text-red-500 mt-1">
              Por favor ingrese una calle válida ❌
            </div>
          )}
          {validated && street.trim() !== "" && (
            <div className="valid-feedback text-green-600 mt-1">
              Calle válida ✅
            </div>
          )}
        </div>

        <div className="flex-1 min-w-[200px]">
          <label htmlFor="streetNumber">Numero de Calle</label>
          <input
            type="text"
            className={`
              flex form-control border-2 rounded-lg p-1 text-black
              ${
                validated &&
                (!/^\d{1,4}$/.test(streetNumber.trim())
                  ? "border-red-500"
                  : "border-green-500")
              }
            `}
            style={{ backgroundColor: "rgb(168, 175, 234)" }}
            id="streetNumber"
            value={streetNumber}
            onChange={(e) => setStreetNumber(e.target.value)}
            placeholder="1234"
            pattern="^\d+$"
            required
          />
          {validated &&
            streetNumber.trim() === "" &&
            !/^\d{1,4}$/.test(streetNumber.trim()) &&
            parseInt(streetNumber.trim()) >= 9999 && (
              <div className="invalid-feedback text-red-500 mt-1">
                El número de calle no puede tener más de 4 dígitos ❌
              </div>
            )}
          {validated && /^\d{1,4}$/.test(streetNumber.trim()) && (
            <div className="valid-feedback text-green-600 mt-1">
              Número de calle válido ✅
            </div>
          )}
        </div>
      </div>

      <div className="form-group flex justify-center items-center mt-4">
        <div className="form-check">
          <input
            className={`form-check-input ${
              validated && !acceptedTerms ? "is-invalid" : ""
            }`}
            type="checkbox"
            id="invalidCheck"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            required
          />
          <label className="form-check-label p-2" htmlFor="invalidCheck">
            Acepto los terminos y condiciones
          </label>
          {validated && !acceptedTerms && (
            <div className="invalid-feedback text-red-500">
              Debes aceptar los terinos y condiciones para registrarte
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 text-center"
          type="submit"
          disabled={loading}
        >
          {loading ? "Registrando..." : "Registrarse"}
        </button>
      </div>
    </form>
  );
}

export default UserRegisterForm;
