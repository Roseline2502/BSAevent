// ============================================================
// js/api/tables.js — Tables de salle
// ============================================================

import { supabase } from "../supabase.js";

// Récupère toutes les tables + leurs sièges occupés
export async function getTables(eventId) {
  const { data, error } = await supabase
    .from("tables_salle")
    .select("*")
    .eq("event_id", eventId)
    .order("nom");

  if (error) { console.error("getTables:", error.message); return []; }
  return data;
}

// Crée une nouvelle table dans la salle
export async function createTable(eventId, nom, capacite) {
  const { data, error } = await supabase
    .from("tables_salle")
    .insert([{ event_id: eventId, nom, capacite }])
    .select()
    .single();

  if (error) { console.error("createTable:", error.message); return null; }
  return data;
}

// Supprime une table
export async function deleteTable(id) {
  const { error } = await supabase
    .from("tables_salle")
    .delete()
    .eq("id", id);

  if (error) { console.error("deleteTable:", error.message); return false; }
  return true;
}