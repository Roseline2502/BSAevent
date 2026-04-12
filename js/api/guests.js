// ============================================================
// js/api/guests.js — Invités + assignation de sièges
// ============================================================
// Tes 4 tables sont : events, guests, tables_salle, seats
// La table "seats" gère l'assignation chaise <-> invité
// ============================================================

import { supabase } from "../supabase.js";

// Récupère tous les invités avec leur siège et table assignés
export async function getGuests(eventId) {
  const { data, error } = await supabase
    .from("guests")
    .select(`
      id,
      nom,
      telephone,
      email,
      categorie,
      statut,
      arrived,
      arrived_at,
      event_id,
      seats (
        id,
        numero_chaise,
        table_id,
        tables_salle ( id, nom, capacite )
      )
    `)
    .eq("event_id", eventId)
    .order("nom");

  if (error) { console.error("getGuests:", error.message); return []; }
  return data;
}

// Ajoute un nouvel invité (sans siège au départ)
export async function addGuest(eventId, fields) {
  const { data, error } = await supabase
    .from("guests")
    .insert([{
      event_id:  eventId,
      nom:       fields.nom,
      telephone: fields.telephone || null,
      email:     fields.email     || null,
      categorie: fields.categorie || "Normal",
      statut:    fields.statut    || "pending",
    }])
    .select()
    .single();

  if (error) { console.error("addGuest:", error.message); return null; }
  return data;
}

// Met à jour les infos d'un invité
export async function updateGuest(id, fields) {
  const { data, error } = await supabase
    .from("guests")
    .update(fields)
    .eq("id", id)
    .select()
    .single();

  if (error) { console.error("updateGuest:", error.message); return null; }
  return data;
}

// Supprime un invité (supprime aussi son siège automatiquement
// grâce à la clé étrangère guest_id dans seats)
export async function deleteGuest(id) {
  // D'abord supprimer le siège lié
  await supabase.from("seats").delete().eq("guest_id", id);
  // Puis supprimer l'invité
  const { error } = await supabase.from("guests").delete().eq("id", id);
  if (error) { console.error("deleteGuest:", error.message); return false; }
  return true;
}

// ---- Gestion des sièges (table seats) ----

// Assigne un siège à un invité
// Crée ou remplace l'entrée dans la table seats
export async function assignSeat(guestId, tableId, numeroChaise) {
  // Supprimer l'ancien siège s'il existe
  await supabase.from("seats").delete().eq("guest_id", guestId);

  // Créer le nouveau siège
  const { data, error } = await supabase
    .from("seats")
    .insert([{
      guest_id:       guestId,
      table_id:       tableId,
      numero_chaise:  numeroChaise,
    }])
    .select()
    .single();

  if (error) {
    // Code 23505 = chaise déjà prise (contrainte unique)
    if (error.code === "23505") {
      alert("Cette chaise est déjà occupée sur cette table !");
    } else {
      console.error("assignSeat:", error.message);
    }
    return null;
  }
  return data;
}

// Libère le siège d'un invité
export async function removeSeat(guestId) {
  const { error } = await supabase
    .from("seats")
    .delete()
    .eq("guest_id", guestId);

  if (error) { console.error("removeSeat:", error.message); return false; }
  return true;
}

// Récupère les numéros de chaises déjà prises sur une table
// Utilisé pour remplir le select "Chaise N°" du formulaire
export async function getOccupiedSeats(tableId, excludeGuestId = null) {
  let query = supabase
    .from("seats")
    .select("numero_chaise, guest_id")
    .eq("table_id", tableId);

  if (excludeGuestId) {
    query = query.neq("guest_id", excludeGuestId);
  }

  const { data, error } = await query;
  if (error) { console.error("getOccupiedSeats:", error.message); return []; }
  return data.map(s => s.numero_chaise);
}