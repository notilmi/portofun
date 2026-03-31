import { useState } from 'react'

/**
 * Represents a single form field with its value, error state, and validation function.
 * @template T - The type of the field's value
 */
type FormValue<T> = {
  /** The current value of the form field */
  value: T
  /** Optional error message to display if validation fails */
  error?: string
  /** Optional validation function that returns an error message if validation fails, or undefined if valid */
  validate?: (value: T) => string | undefined
}

type Value<T extends Record<string, FormValue<any>>> = {
  [K in keyof T]: T[K]['value']
}

/**
 * A custom React hook for managing form state with validation capabilities.
 *
 * @template T - A record type where each key represents a form field and each value is a FormValue object
 *
 * @param {T} initialValues - The initial values for all form fields, where each field is a FormValue object containing value, error, and optional validate function
 *
 * @returns An object containing:
 * - `values`: The current state of all form fields
 * - `handleChange`: Function to update a specific field's value and clear its error
 * - `resetForm`: Function to reset all form fields to their initial values
 * - `validate`: Function to validate all form fields that have a validate function defined, returns true if all validations pass
 *
 * @example
 * ```typescript
 * const form = useForm({
 *   email: {
 *     value: '',
 *     error: undefined,
 *     validate: (val) => !val.includes('@') ? 'Invalid email' : undefined
 *   }
 * });
 *
 * form.handleChange('email', 'user@example.com');
 * const isValid = form.validate();
 * ```
 */
function useForm<T extends Record<string, FormValue<any>>>(
  initialValues: T,
): {
  values: T
  handleChange: (field: keyof T, value: any) => void
  setFieldError: (field: keyof T, error?: string) => void
  validateField: (field: keyof T) => boolean
  resetForm: () => void
  validate: () => boolean
  getValues: () => Value<T>
} {
  const [formState, setFormState] = useState<T>(initialValues)

  /**
   * Updates a specific form field's value and clears any existing error.
   * This is typically called when the user types or changes input.
   */
  const handleChange = (field: keyof T, value: any) => {
    setFormState((prevState) => ({
      ...prevState,
      // Update the specific field with the new value and clear any existing error
      [field]: {
        ...prevState[field],
        value,
        error: undefined, // Clear error when user makes changes
      },
    }))
  }

  const setFieldError = (field: keyof T, error?: string) => {
    setFormState((prevState) => ({
      ...prevState,
      [field]: {
        ...prevState[field],
        error,
      },
    }))
  }

  const validateField = (field: keyof T): boolean => {
    const fieldValue = formState[field]
    if (!fieldValue?.validate) {
      return true
    }

    const error = fieldValue.validate(fieldValue.value)
    setFieldError(field, error)
    return !error
  }

  /**
   * Resets all form fields back to their initial values and clears all errors.
   */
  const resetForm = () => {
    setFormState(initialValues)
  }

  const getValues = (): Value<T> => {
    const values: Partial<Value<T>> = {}
    for (const key in formState) {
      values[key] = formState[key].value
    }
    return values as Value<T>
  }

  /**
   * Validates all form fields that have a validate function defined.
   * Updates the form state with any validation errors found.
   * @returns true if all validations pass, false if any validation fails
   */
  const validate = (): boolean => {
    let isValid = true
    // Create a shallow copy to accumulate any validation errors
    const newFormState = { ...formState }

    // Iterate through all form fields
    for (const field in formState) {
      const fieldValue = formState[field]
      // Only validate fields that have a validate function
      if (fieldValue.validate) {
        const error = fieldValue.validate(fieldValue.value)
        if (error) {
          // Mark form as invalid and store the error message
          isValid = false
          newFormState[field] = { ...fieldValue, error }
        }
      }
    }

    // Update state with any validation errors
    setFormState(newFormState)
    return isValid
  }

  return {
    values: formState,
    getValues,
    handleChange,
    setFieldError,
    validateField,
    resetForm,
    validate,
  }
}
export { useForm, type FormValue, type Value }