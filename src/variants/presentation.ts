import { useSyncExternalStore } from "react";

/**
 * Presentation only: shows the hero as an agency without a photo would see it (key 3, see VersionSwitch).
 * Kept in memory for the visit, so it survives switching between V1 and V2.
 */
let noPhoto = false;
const listeners = new Set<() => void>();

export const presentation = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  noPhoto: () => noPhoto,
  setNoPhoto(value: boolean) {
    if (value === noPhoto) return;
    noPhoto = value;
    listeners.forEach((listener) => listener());
  },
};

export const useNoPhotoPreview = () => useSyncExternalStore(presentation.subscribe, presentation.noPhoto, () => false);
