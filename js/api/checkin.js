// ============================================================
// js/api/checkin.js — Validation arrivées + temps réel
// ============================================================

import { supabase } from "../supabase.js";

// Valide l'arrivée d'un invité
export async function checkIn(guestId) {
  const { data, error } = await supabase
    .from("guests")
    .update({
      arrived:    true,
      arrived_at: new Date().toISOString(),
    })
    .eq("id", guestId)
    .select("id, nom, arrived, arrived_at")
    .single();

  if (error) { console.error("checkIn:", error.message); return null; }
  return data;
}

// Annule l'arrivée (en cas d'erreur de saisie)
export async function cancelCheckIn(guestId) {
  const { data, error } = await supabase
    .from("guests")
    .update({ arrived: false, arrived_at: null })
    .eq("id", guestId)
    .select("id, nom, arrived")
    .single();

  if (error) { console.error("cancelCheckIn:", error.message); return null; }
  return data;
}

// S'abonne aux mises à jour en temps réel
// Quand un agent valide une arrivée sur son téléphone,
// tous les autres écrans connectés se mettent à jour
// automatiquement sans recharger la page.
//
// Exemple d'utilisation dans checkin.html :
//
//   const channel = subscribeToCheckIn(EVENT_ID, (guest) => {
//     // guest = invité mis à jour { id, nom, arrived, arrived_at }
//     updateRow(guest);   // met à jour la ligne dans l'UI
//     updateCounter();    // met à jour le compteur
//   });
//
//   // Pour arrêter (quand on quitte la page) :
//   channel.unsubscribe();
//
export function subscribeToCheckIn(eventId, onUpdate) {
  return supabase
    .channel("checkin-live-" + eventId)
    .on(
      "postgres_changes",
      {
        event:  "UPDATE",
        schema: "public",
        table:  "guests",
        filter: `event_id=eq.${eventId}`,
      },
      (payload) => onUpdate(payload.new)
    )
    .subscribe();
}