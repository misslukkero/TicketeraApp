"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

export type Locale = "es" | "en" | "it"

export interface Translations {
ticketera: {
    title: string
    createTicket: string
    titleField: string
    descField: string
    priority: string
    btnCreate: string
    btnResolve: string
    btnDelete: string
    statusOpen: string
    statusResolved: string
    priorityLow: string
    priorityMedium: string
    priorityHigh: string
    errors: {
      ERR_FIELDS_REQUIRED: string
    }
  }
}

const translations: Record<Locale, Translations> = {
  es: {
    ticketera: {
      title: "Ticketera IT - Gestión de Incidencias",
      createTicket: "Crear Ticket",
      titleField: "Título",
      descField: "Descripción",
      priority: "Prioridad",
      btnCreate: "Crear Ticket",
      btnResolve: "Resolver",
      btnDelete: "Borrar",
      statusOpen: "Abierto",
      statusResolved: "Resuelto",
      priorityLow: "Baja",
      priorityMedium: "Media",
      priorityHigh: "Alta",
      errors: { ERR_FIELDS_REQUIRED: "El título y la descripción son obligatorios." }
    }
  },
  en: {
    ticketera: {
      title: "IT Ticket Manager - Incident Management",
      createTicket: "Create Ticket",
      titleField: "Title",
      descField: "Description",
      priority: "Priority",
      btnCreate: "Create Ticket",
      btnResolve: "Resolve",
      btnDelete: "Delete",
      statusOpen: "Open",
      statusResolved: "Resolved",
      priorityLow: "Low",
      priorityMedium: "Medium",
      priorityHigh: "High",
      errors: { ERR_FIELDS_REQUIRED: "Title and description are required." }
    }
  },
  it: {
    ticketera: {
      title: "Ticketera IT - Gestione degli Incidenti",
      createTicket: "Crea Ticket",
      titleField: "Titolo",
      descField: "Descrizione",
      priority: "Priorità",
      btnCreate: "Crea Ticket",
      btnResolve: "Risolvi",
      btnDelete: "Elimina",
      statusOpen: "Aperto",
      statusResolved: "Risolto",
      priorityLow: "Bassa",
      priorityMedium: "Media",
      priorityHigh: "Alta",
      errors: { ERR_FIELDS_REQUIRED: "Il titolo e la descrizione sono obbligatori." }
    }
  }
}

interface I18nContextType {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("it")

  useEffect(() => {
    const saved = localStorage.getItem("locale") as Locale
    if (saved && translations[saved]) {
      setLocale(saved)
    }
  }, [])

  const handleSetLocale = (newLocale: Locale) => {
    setLocale(newLocale)
    localStorage.setItem("locale", newLocale)
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale: handleSetLocale, t: translations[locale] }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }    
  return context
}


export const localeNames: Record<Locale, string> = {
  es: "Español",
  en: "English",
  it: "Italiano",
}
