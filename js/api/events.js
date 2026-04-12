// ============================================================
// js/api/events.js — Fonctions pour les événements
// ============================================================

import { supabase } from "../supabase.js";

// ── Charger UN événement par son ID ──────────────────────────
// Utilisé dans le header de chaque page (nom, date, lieu)
export async function getEvent(eventId) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) { console.error("getEvent:", error.message); return null; }
  return data;
}

// ── Charger TOUS les événements ───────────────────────────────
// Utilisé dans select-event.html pour afficher la liste
export async function getAllEvents() {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) { console.error("getAllEvents:", error.message); return []; }
  return data;
}

// ── Créer un nouvel événement ─────────────────────────────────
// Utilisé dans new-event.html
// Retourne { data, error } pour que la page puisse gérer les erreurs
export async function createEvent(event) {
  const { data, error } = await supabase
    .from("events")
    .insert([event])
    .select()
    .single();

  if (error) {
    console.error("createEvent:", error.message);
    return { data: null, error };
  }
  return { data, error: null };
}

// ── Mettre à jour un événement ────────────────────────────────
// Utilisé si tu veux modifier le nom/date/lieu plus tard
export async function updateEvent(id, fields) {
  const { data, error } = await supabase
    .from("events")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updateEvent:", error.message); return null; }
  return data;
}