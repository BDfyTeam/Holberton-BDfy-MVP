import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function MyForm() {
    const navigate = useNavigate();
    const [validated, setValidated] = useState(false);
  
    const handleSubmit = (event: any) => {
      const form = event.currentTarget;
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        event.preventDefault();
        console.log('Formulario válido, redireccionando...');
        navigate('/');
      }
  
      setValidated(true);
    };
  
    return (
      <form
        className={`needs-validation ${validated ? 'was-validated' : ''} bg-rgb(168, 175, 234) border-2 border-gray-300 rounded-lg p-6`}
        noValidate
        onSubmit={handleSubmit}
      >
        <div className="form-row">
          <div className="col-md-4 mb-3">
            <label htmlFor="validationCustom01">Nombre</label>
            <input
              type="text"
              className="flex form-control border-2 border-gray-300 rounded-lg p-1"
              id="validationCustom01"
              placeholder="Compacto"
              defaultValue=""
              required
            />
          </div>
  
          <div className="col-md-4 mb-3">
            <label htmlFor="validationCustom02">Apellido</label>
            <input
              type="text"
              className="flex form-control border-2 border-gray-300 rounded-lg p-1"
              id="validationCustom02"
              placeholder="Andrada"
              defaultValue=""
              required
            />
          </div>
  
          <div className="col-md-4 mb-3">
            <label htmlFor="validationCustomUsername">Email</label>
            <div className=" flex input-group border-2 border-gray-300 rounded-lg p-1">
              <div className="input-group-prepend">
                <span className="input-group-text" id="inputGroupPrepend">
                  @
                </span>
              </div>
              <input
                type="text"
                className="form-control"
                id="validationCustomUsername"
                placeholder="mail.com"
                aria-describedby="inputGroupPrepend"
                required
              />
            </div>
          </div>
        </div>
  
        <div className="form-row">
          <div className="col-md-6 mb-3">
            <label htmlFor="validationCustom03">Contraseña</label>
            <input
              type="text"
              className="flex form-control border-2 border-gray-300 rounded-lg p-1"
              id="validationCustom03"
              placeholder="MotoCompacto123"
              required
            />
            <div className="invalid-feedback">Please provide a valid city.</div>
          </div>
  
          <div className="col-md-3 mb-3">
            <label htmlFor="validationCustom04">State</label>
            <input
              type="text"
              className="form-control"
              id="validationCustom04"
              placeholder="State"
              required
            />
            <div className="invalid-feedback">Please provide a valid state.</div>
          </div>
  
          <div className="col-md-3 mb-3">
            <label htmlFor="validationCustom05">Zip</label>
            <input
              type="text"
              className="form-control"
              id="validationCustom05"
              placeholder="Zip"
              required
            />
            <div className="invalid-feedback">Please provide a valid zip.</div>
          </div>
        </div>
  
        <div className="form-group">
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              value=""
              id="invalidCheck"
              required
            />
            <label className="form-check-label" htmlFor="invalidCheck">
              Agree to terms and conditions
            </label>
            <div className="invalid-feedback">
              You must agree before submitting.
            </div>
          </div>
        </div>
  
        <button className="btn btn-primary" type="submit">
          Submit form
        </button>
      </form>
    );
  }

  export default MyForm;