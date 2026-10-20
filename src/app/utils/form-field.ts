/** Reads a form field as a string, treating a missing or file value as empty. */
export function readFormField(formData: FormData, name: string): string {
  const value = formData.get(name);

  return typeof value === "string" ? value : "";
}
