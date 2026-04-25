// ============================================================
// js/api/prestataires.js — Fonctions pour les prestataires
// ============================================================

import { supabase } from "../supabase.js";

// Récupère tous les prestataires d'un événement
export async function getPrestataires(eventId) {
  const { data, error } = await supabase
    .from("prestataires")
    .select("*")
    .eq("event_id", eventId)
    .order("categorie");

  if (error) { console.error("getPrestataires:", error.message); return []; }
  return data;
}

// Ajoute un prestataire
export async function addPrestataire(eventId, fields) {
  const { data, error } = await supabase
    .from("prestataires")
    .insert([{ event_id: eventId, ...fields }])
    .select()
    .single();

  if (error) { console.error("addPrestataire:", error.message); return null; }
  return data;
}

// Met à jour un prestataire
export async function updatePrestataire(id, fields) {
  const { data, error } = await supabase
    .from("prestataires")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updatePrestataire:", error.message); return null; }
  return data;
}

// Supprime un prestataire
export async function deletePrestataire(id) {
  const { error } = await supabase
    .from("prestataires")
    .delete()
    .eq("id", id);

  if (error) { console.error("deletePrestataire:", error.message); return false; }
  return true;
}