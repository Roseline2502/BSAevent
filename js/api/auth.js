// ============================================================
// js/api/auth.js — Connexion / déconnexion / session
// ============================================================

import { supabase } from "../supabase.js";

// ── Détecte si on est dans /pages/ ou à la racine ────────────
// Utilisé pour construire les bons chemins relatifs
function rootPath() {
  const path = window.location.pathname;
  // Si l'URL contient /pages/, on remonte d'un niveau
  return path.includes("/pages/") ? "../" : "./";
}

// ── Connexion ─────────────────────────────────────────────────
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("signIn:", error.message);
    return { user: null, error: error.message };
  }
  return { user: data.user, error: null };
}

// ── Déconnexion ───────────────────────────────────────────────
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) console.error("signOut:", error.message);
  window.location.href = rootPath() + "login.html";
}

// ── Session active ────────────────────────────────────────────
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Utilisateur connecté ──────────────────────────────────────
export async function getUser() {
  const { data } = await supabase.auth.getUser();
  return data.user;
}

// ── Protection de page — redirige vers login si pas connecté ──
// À appeler en haut de chaque page protégée
export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    window.location.href = rootPath() + "login.html";
    return null;
  }
  return session;
}

// ── Sauvegarde l'événement sélectionné ───────────────────────
export function saveSelectedEvent(eventId, eventNom) {
  sessionStorage.setItem("selected_event_id",  eventId);
  sessionStorage.setItem("selected_event_nom", eventNom);
}

// ── Récupère l'événement sélectionné ─────────────────────────
export function getSelectedEvent() {
  return {
    id:  sessionStorage.getItem("selected_event_id"),
    nom: sessionStorage.getItem("selected_event_nom"),
  };
}

// ── Protection événement — redirige si aucun événement choisi ─
export function requireEvent() {
  const ev = getSelectedEvent();
  if (!ev.id) {
    window.location.href = rootPath() + "select-event.html";
    return null;
  }
  return ev;
}