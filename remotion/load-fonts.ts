import type { CaptionFont } from "./remotion.types";

import {
  loadFont as loadMontserrat,
  fontFamily as montserratFamily,
} from "@remotion/google-fonts/Montserrat";
import {
  loadFont as loadBangers,
  fontFamily as bangersFamily,
} from "@remotion/google-fonts/Bangers";
import {
  loadFont as loadRoboto,
  fontFamily as robotoFamily,
} from "@remotion/google-fonts/Roboto";
import {
  loadFont as loadOswald,
  fontFamily as oswaldFamily,
} from "@remotion/google-fonts/Oswald";
import {
  loadFont as loadPoppins,
  fontFamily as poppinsFamily,
} from "@remotion/google-fonts/Poppins";

const fontMap: Record<CaptionFont, { load: () => void; fontFamily: string }> = {
  Montserrat: {
    load: () =>
      loadMontserrat("normal", { weights: ["800"], subsets: ["latin"] }),
    fontFamily: montserratFamily,
  },
  Bangers: {
    load: () => loadBangers("normal", { weights: ["400"], subsets: ["latin"] }),
    fontFamily: bangersFamily,
  },
  Roboto: {
    load: () => loadRoboto("normal", { weights: ["900"], subsets: ["latin"] }),
    fontFamily: robotoFamily,
  },
  Oswald: {
    load: () => loadOswald("normal", { weights: ["700"], subsets: ["latin"] }),
    fontFamily: oswaldFamily,
  },
  Poppins: {
    load: () => loadPoppins("normal", { weights: ["800"], subsets: ["latin"] }),
    fontFamily: poppinsFamily,
  },
};

export function loadCaptionFont(font: CaptionFont): string {
  const entry = fontMap[font];
  entry.load();
  return entry.fontFamily;
}
