import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper function to extract JSON from text that might contain additional content
export function extractJsonFromText(text: string): any {
  try {
    // First try direct parsing
    return JSON.parse(text)
  } catch (error) {
    // If that fails, try to find JSON array in the text
    try {
      // Look for array pattern
      const arrayMatch = text.match(/\[\s*\{[\s\S]*\}\s*\]/)
      if (arrayMatch) {
        return JSON.parse(arrayMatch[0])
      }

      // Look for object pattern
      const objectMatch = text.match(/\{\s*"[\s\S]*"\s*:[\s\S]*\}/)
      if (objectMatch) {
        return JSON.parse(objectMatch[0])
      }

      // Try to extract anything between triple backticks
      const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
      if (codeBlockMatch && codeBlockMatch[1]) {
        return JSON.parse(codeBlockMatch[1].trim())
      }
    } catch (innerError) {
      console.error("Failed to extract JSON from text:", innerError)
    }

    // If all parsing attempts fail, return empty array
    return []
  }
}
