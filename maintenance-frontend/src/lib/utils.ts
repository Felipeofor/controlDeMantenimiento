
export const getErrorMessage = (error: any, defaultMessage: string = 'Ocurrió un error inesperado'): string => {
  if (!error?.response?.data) return defaultMessage;

  const data = error.response.data;

  // Case 1: Validation errors object (Spring Boot @Valid style)
  // { errors: { field: "message", ... } }
  if (data.errors && typeof data.errors === 'object') {
    const messages = Object.values(data.errors);
    if (messages.length > 0) return String(messages[0]);
  }

  // Case 2: Direct message field
  // { message: "Error message" }
  if (data.message) {
    return data.message;
  }

  // Case 3: Error field
  // { error: "Error details" }
  if (data.error) {
    return data.error;
  }

  return defaultMessage;
};
