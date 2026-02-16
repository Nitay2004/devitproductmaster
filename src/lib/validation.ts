export const validateName = (name: string | null): { isValid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name is required" }
  }
  
  // Custom check: should not be only numbers
  const onlyNumbers = /^\d+$/.test(name.trim())
  if (onlyNumbers) {
    return { isValid: false, error: `"${name}" is not a valid name (cannot be only numbers)` }
  }
  
  if (name.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" }
  }

  return { isValid: true }
}

export const validatePrice = (price: number | null, fieldName: string): { isValid: boolean; error?: string } => {
  if (price === null) return { isValid: true } // Optional fields are handled elsewhere
  
  if (isNaN(price)) {
    return { isValid: false, error: `${fieldName} must be a valid number` }
  }
  
  if (price < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` }
  }
  
  return { isValid: true }
}
