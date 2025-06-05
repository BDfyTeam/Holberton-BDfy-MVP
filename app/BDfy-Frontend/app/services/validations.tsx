
// VALIDACION DE LA CONTRASEÑA
export function isPasswordValid(pwd: string): boolean {
  if (!pwd) return false;
  const lengthValid = pwd.length >= 8 && pwd.length <= 20;
  const hasUppercase = /[A-Z]/.test(pwd);
  const hasLowercase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  return lengthValid && hasUppercase && hasLowercase && hasNumber;
}

// VALIDACION DE EMAIL
export function isEmailValid(email: string): boolean {
  if (!email) return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
}

// VALIDACION DE DOCUMENTO
export function isDocumentValid(documentNumber: string): boolean {
    if (!documentNumber) return false;
    const documentRegex = /^[1-9]\d{7,8}$/; // Assuming document numbers are 8 to 10 digits
    return documentRegex.test(documentNumber.trim());
}
