import { browser } from '$app/environment';
import type { JurisdictionType } from '../lib/types'; // ← adjust to your actual import path

// Cookie helpers (client-only)
function getCookie(name: string): string | null {
  if (!browser) return null;
  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trimStart();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }
  return null;
}

function setCookie(name: string, value: string, days = 365) {
  if (!browser) return;
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`;
}

function deleteCookie(name: string) {
  if (!browser) return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// Reactive state with runes (Svelte 5)
let chosenJurisdiction = $state<JurisdictionType | null>(null);
let juris_uuid = $state<string>('');
let juris_logo = $state<string>('');

// Persistence logic – runs once on module load (client-side)
$effect.root(() => {
  if (browser) {
    // Load persisted values
    const storedJuris = getCookie('juris_jurisdiction');
    if (storedJuris !== null) {
      try {
        chosenJurisdiction = JSON.parse(storedJuris) as JurisdictionType;
      } catch (e) {
        console.error('Failed to parse stored jurisdiction', e);
        deleteCookie('juris_jurisdiction');
      }
    }

    const storedUuid = getCookie('juris_uuid');
    if (storedUuid !== null) {
      juris_uuid = storedUuid;
    }

    const storedLogo = getCookie('juris_logo');
    if (storedLogo !== null) {
      juris_logo = storedLogo;
    }

    // Save on any change
    $effect(() => {
      if (chosenJurisdiction) {
        setCookie('juris_jurisdiction', JSON.stringify(chosenJurisdiction));
      } else {
        deleteCookie('juris_jurisdiction');
      }
    });

    $effect(() => {
      if (juris_uuid) {
        setCookie('juris_uuid', juris_uuid);
      } else {
        deleteCookie('juris_uuid');
      }
    });

    $effect(() => {
      if (juris_logo) {
        setCookie('juris_logo', juris_logo);
      } else {
        deleteCookie('juris_logo');
      }
    });
  }
});

// Public API – matches your original interface exactly
function setJurisdiction(juris: JurisdictionType) {
  console.log('ID passed to setUUID: ', juris);
  if (juris !== undefined) {
    chosenJurisdiction = juris;
    juris_uuid = '/' + juris.id;
  }
}

function clearUUID() {
  juris_logo = '';
  juris_uuid = '';
}

function setJurisLogo(url: string) {
  juris_logo = url;
  console.log('STATE: jurisdiction logo ', juris_logo);
}

export const jurisState = () => ({
  setJurisdiction,
  setJurisLogo,
  clearUUID,
  get uuid() {
    return juris_uuid;
  },
  get jurisdiction() {
    return chosenJurisdiction;
  },
  get logo_url() {
    return juris_logo;
  }
});
