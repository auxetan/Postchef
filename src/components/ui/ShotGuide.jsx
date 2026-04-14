import { PC_GREEN } from '../../utils/colors.js'
/**
 * ShotGuide — Illustrations de plans de caméra pour le script vidéo.
 * Chaque composant est un SVG 48×76 (phone portrait) montrant le cadrage exact.
 * DA PostChef : #1D9E75 green, #1A1A18 ink, #F5F5F4 bg, #CC8844 amber (chaud plat).
 */

// ── Étape 1 : Hook visuel ─────────────────────────────────────────────────────
// Écran sombre façon TikTok, accroche texte en surimpression, badge HOOK vert
function ShotHook() {
  return (
    <svg width="48" height="76" viewBox="0 0 48 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="76" rx="8" fill="#1A1A18"/>
      <rect x="3" y="10" width="42" height="56" rx="2" fill="#0A0F0C"/>
      <rect x="16" y="5" width="16" height="3" rx="1.5" fill="#2A2A28"/>

      {/* Food glow blobs */}
      <ellipse cx="22" cy="42" rx="16" ry="13" fill={PC_GREEN} fillOpacity="0.22"/>
      <ellipse cx="31" cy="35" rx="9" ry="8" fill="#CC8844" fillOpacity="0.18"/>
      <circle cx="17" cy="36" r="7" fill={PC_GREEN} fillOpacity="0.15"/>

      {/* Top overlay bar — texte hook */}
      <rect x="3" y="10" width="42" height="15" rx="2" fill="#000000" fillOpacity="0.62"/>
      <rect x="8" y="15" width="20" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.90"/>
      <rect x="8" y="20" width="13" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.50"/>

      {/* Badge HOOK */}
      <rect x="31" y="12" width="12" height="9" rx="2" fill={PC_GREEN}/>
      {/* Étoile dans le badge */}
      <path d="M37 13.5L37.5 15.5L39.5 16L37.5 16.5L37 18.5L36.5 16.5L34.5 16L36.5 15.5Z" fill="white"/>

      {/* Bottom caption bar */}
      <rect x="3" y="56" width="42" height="10" rx="2" fill="#000000" fillOpacity="0.55"/>
      <rect x="8" y="59" width="22" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.75"/>
      <rect x="8" y="63.5" width="15" height="2" rx="1" fill="#FFFFFF" fillOpacity="0.40"/>
    </svg>
  )
}

// ── Étape 2 : Plan principal ──────────────────────────────────────────────────
// Écran clair, grille règle des tiers, sujet centré, coins de cadrage verts
function ShotMain() {
  return (
    <svg width="48" height="76" viewBox="0 0 48 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="76" rx="8" fill="#1A1A18"/>
      <rect x="3" y="10" width="42" height="56" rx="2" fill="#F5F5F4"/>
      <rect x="16" y="5" width="16" height="3" rx="1.5" fill="#2A2A28"/>

      {/* Règle des tiers — verticales */}
      <line x1="17" y1="10" x2="17" y2="66" stroke="#1A1A18" strokeOpacity="0.07" strokeWidth="0.5"/>
      <line x1="31" y1="10" x2="31" y2="66" stroke="#1A1A18" strokeOpacity="0.07" strokeWidth="0.5"/>
      {/* Règle des tiers — horizontales */}
      <line x1="3" y1="28.7" x2="45" y2="28.7" stroke="#1A1A18" strokeOpacity="0.07" strokeWidth="0.5"/>
      <line x1="3" y1="47.3" x2="45" y2="47.3" stroke="#1A1A18" strokeOpacity="0.07" strokeWidth="0.5"/>

      {/* Sujet principal — plat */}
      <circle cx="22" cy="40" r="13" fill={PC_GREEN} fillOpacity="0.10"/>
      <circle cx="22" cy="40" r="9" fill={PC_GREEN} fillOpacity="0.18"/>
      <circle cx="22" cy="40" r="5.5" fill={PC_GREEN} fillOpacity="0.32"/>

      {/* Coins de cadrage verts */}
      <path d="M6 13L6 18M6 13L11 13" stroke={PC_GREEN} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M42 13L42 18M42 13L37 13" stroke={PC_GREEN} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M6 63L6 58M6 63L11 63" stroke={PC_GREEN} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M42 63L42 58M42 63L37 63" stroke={PC_GREEN} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

// ── Étape 3 : Gros plan / détail ─────────────────────────────────────────────
// Écran sombre, cercle de mise au point avec pointillés verts, texture du plat
function ShotCloseUp() {
  return (
    <svg width="48" height="76" viewBox="0 0 48 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="76" rx="8" fill="#1A1A18"/>
      <rect x="3" y="10" width="42" height="56" rx="2" fill="#111411"/>
      <rect x="16" y="5" width="16" height="3" rx="1.5" fill="#2A2A28"/>

      {/* Texture background (hors focus) */}
      <circle cx="7"  cy="15" r="1.2" fill={PC_GREEN} fillOpacity="0.18"/>
      <circle cx="14" cy="13" r="1.0" fill="#CC8844" fillOpacity="0.16"/>
      <circle cx="22" cy="12" r="1.3" fill={PC_GREEN} fillOpacity="0.14"/>
      <circle cx="32" cy="14" r="1.0" fill="#CC8844" fillOpacity="0.18"/>
      <circle cx="41" cy="12" r="1.2" fill={PC_GREEN} fillOpacity="0.14"/>
      <circle cx="7"  cy="62" r="1.2" fill="#CC8844" fillOpacity="0.14"/>
      <circle cx="43" cy="60" r="1.0" fill={PC_GREEN} fillOpacity="0.16"/>
      <circle cx="38" cy="64" r="1.3" fill="#CC8844" fillOpacity="0.14"/>

      {/* Halo de focus */}
      <circle cx="24" cy="40" r="16" fill={PC_GREEN} fillOpacity="0.10"/>
      {/* Cercle pointillé focus */}
      <circle cx="24" cy="40" r="13.5" stroke={PC_GREEN} strokeWidth="1.2" strokeDasharray="3 2.5"/>

      {/* Texture / détails du plat dans le cercle */}
      <circle cx="19" cy="37" r="2.5"  fill={PC_GREEN} fillOpacity="0.55"/>
      <circle cx="27" cy="35" r="2.0"  fill="#CC8844" fillOpacity="0.50"/>
      <circle cx="30" cy="42" r="3.0"  fill={PC_GREEN} fillOpacity="0.42"/>
      <circle cx="20" cy="44" r="2.0"  fill="#CC8844" fillOpacity="0.42"/>
      <circle cx="28" cy="45" r="2.5"  fill={PC_GREEN} fillOpacity="0.48"/>
      <circle cx="23" cy="39" r="1.5"  fill="#FFFFFF"  fillOpacity="0.60"/>

      {/* Lignes de zoom depuis les coins */}
      <line x1="5"  y1="12" x2="12" y2="27" stroke={PC_GREEN} strokeWidth="0.6" strokeOpacity="0.35"/>
      <line x1="43" y1="12" x2="36" y2="27" stroke={PC_GREEN} strokeWidth="0.6" strokeOpacity="0.35"/>
    </svg>
  )
}

// ── Étape 4 : Résultat / révélation ──────────────────────────────────────────
// Écran clair, assiette centrée stylisée, étoiles autour, badge ✓ vert
function ShotResult() {
  return (
    <svg width="48" height="76" viewBox="0 0 48 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="76" rx="8" fill="#1A1A18"/>
      <rect x="3" y="10" width="42" height="56" rx="2" fill="#F9F9F8"/>
      <rect x="16" y="5" width="16" height="3" rx="1.5" fill="#2A2A28"/>

      {/* Halo assiette */}
      <circle cx="24" cy="41" r="16" fill={PC_GREEN} fillOpacity="0.07"/>
      {/* Assiette */}
      <circle cx="24" cy="41" r="12.5" fill="white" stroke="#E8E8E6" strokeWidth="1"/>
      {/* Rim intérieur */}
      <circle cx="24" cy="41" r="10" fill="#F5F5F4" stroke="#E8E8E6" strokeWidth="0.5"/>
      {/* Plat sur l'assiette */}
      <circle cx="24" cy="41" r="7" fill={PC_GREEN} fillOpacity="0.20"/>
      <ellipse cx="22" cy="40" rx="4" ry="3.5" fill={PC_GREEN} fillOpacity="0.38"/>
      <ellipse cx="27" cy="42" rx="3" ry="2.8" fill="#CC8844" fillOpacity="0.28"/>

      {/* Sparkles */}
      <path d="M38 23L38.6 25.2L40.5 25.8L38.6 26.4L38 28.6L37.4 26.4L35.5 25.8L37.4 25.2Z" fill={PC_GREEN}/>
      <path d="M11 19L11.4 20.8L13.2 21.2L11.4 21.6L11 23.4L10.6 21.6L8.8 21.2L10.6 20.8Z" fill={PC_GREEN} fillOpacity="0.60"/>
      <path d="M39 53L39.3 54.6L41 54.9L39.3 55.2L39 56.8L38.7 55.2L37 54.9L38.7 54.6Z" fill="#CC8844" fillOpacity="0.80"/>

      {/* Badge ✓ */}
      <circle cx="35" cy="31" r="5.5" fill={PC_GREEN}/>
      <path d="M32 31L34 33.5L38 28" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Étape 5 : Call to action ──────────────────────────────────────────────────
// Écran sombre, overlay bas, bouton pill vert avec flèche, flèche indicateur
function ShotCTA() {
  return (
    <svg width="48" height="76" viewBox="0 0 48 76" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="76" rx="8" fill="#1A1A18"/>
      <rect x="3" y="10" width="42" height="56" rx="2" fill="#0A0F0C"/>
      <rect x="16" y="5" width="16" height="3" rx="1.5" fill="#2A2A28"/>

      {/* Ambiance restaurant en fond */}
      <ellipse cx="18" cy="31" rx="14" ry="12" fill={PC_GREEN} fillOpacity="0.18"/>
      <ellipse cx="33" cy="27" rx="9" ry="8" fill="#CC8844" fillOpacity="0.12"/>

      {/* Dark overlay bas */}
      <rect x="3" y="38" width="42" height="28" rx="2" fill="#000000" fillOpacity="0.72"/>

      {/* Lignes texte restaurant */}
      <rect x="9" y="42" width="19" height="2.5" rx="1.25" fill="#FFFFFF" fillOpacity="0.85"/>
      <rect x="9" y="47" width="13" height="2"   rx="1"    fill="#FFFFFF" fillOpacity="0.50"/>

      {/* Bouton CTA — pill vert */}
      <rect x="8" y="54" width="32" height="9" rx="4.5" fill={PC_GREEN}/>
      {/* Flèche dans le bouton */}
      <line x1="18" y1="58.5" x2="27" y2="58.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M25 56.5L27.5 58.5L25 60.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>

      {/* Flèche indicateur vers le bouton */}
      <line x1="40" y1="48" x2="40" y2="52" stroke={PC_GREEN} strokeWidth="1" strokeLinecap="round"/>
      <path d="M38 50.5L40 52.5L42 50.5" stroke={PC_GREEN} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Export principal ──────────────────────────────────────────────────────────
const SHOT_MAP = {
  1: ShotHook,
  2: ShotMain,
  3: ShotCloseUp,
  4: ShotResult,
  5: ShotCTA,
}

export function ShotIllustration({ step }) {
  const Component = SHOT_MAP[step] || ShotMain
  return <Component />
}

export default ShotIllustration
