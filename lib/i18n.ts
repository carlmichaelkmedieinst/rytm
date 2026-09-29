export type Locale = "sv" | "en";

export const LOCALE_STORAGE_KEY = "rytm_locale";

const sv = {
  navProduct: "Produkt",
  navInternal: "Internt",
  headlineLine1: "Din träning.",
  headlineLine2: "Din utveckling.",
  frequencyQuestion: "Hur ofta tränar du vanligtvis?",
  frequencyN: "{count} pass / vecka",
  frequency5: "5+ pass / vecka",
  weight: "Vikt",
  reps: "Repetitioner",
  saveWorkout: "Spara passet",
  saving: "Sparar",
  workoutSaved: "Passet är sparat.",
  firstPointSaved: "Första datapunkten är sparad.",
  firstPointNext: "Nästa gång du loggar samma övning kan Rytm börja jämföra din träning.",
  startNewWorkout: "Starta nytt pass",
  lastTime: "Senast",
  previous: "Förra gången",
  now: "Nu",
  sameWeight: "vid samma vikt",
  sameReps: "vid samma repetitioner",
  sameResult: "Samma vikt och repetitioner",
  enterWeight: "Ange en vikt",
  enterReps: "Ange repetitioner",
  sessionFailed: "Sessionen kunde inte startas.",
  sessionFailedAnonymous:
    "Anonym inloggning är avstängd i Supabase-projektet. Aktivera Anonymous under Authentication → Providers.",
  somethingWrong: "Något gick fel",
  anonymousMissing: "Anonym session saknas",
  userDataMissing: "Användardata saknas",
  frequencyMissing: "Träningsfrekvens saknas",
  workoutNotSaved: "Passet kunde inte sparas",
  envMissing: "Supabase-miljövariabler saknas",
  confirmGroup: "Bytet återställer demon för den här användaren. Fortsätt?",
  confirmReset: "Återställ demon för den här användaren?",
  close: "Stäng",
  internalTitle: "Intern experimentvy",
  user: "Användare",
  trainingData: "Träningsdata",
  eventLog: "Händelselogg",
  systemStatus: "Systemstatus",
  timeWindow: "Tidsfönster",
  testGroup: "Testgrupp",
  controlGroup: "Kontrollgrupp",
  notificationsOn: "Notiser på",
  notificationsOff: "Notiser av",
  testLogic:
    "Initial testlogik: 2 pass/vecka ger +3 dagar, 3 pass/vecka +2 dagar, 4 eller 5 pass/vecka +1 dag från första passet. Det är inte validerat användarbeteende.",
  kpiTitle: "Första jämförelse inom 14 dagar",
  kpiPending: "Väntar",
  kpiAchieved: "Uppnådd",
  kpiMissed: "Inte uppnådd",
  windowCommunicateTitle: "Dag 0–7",
  windowCommunicateDetail: "Kommunikation + observation",
  windowObserveTitle: "Dag 7–14",
  windowObserveDetail: "Endast observation",
  windowFinalTitle: "Dag 14",
  windowFinalDetail: "Slutlig mätning",
  advanceDay: "+1 dag",
  nextWindow: "Gå till nästa träningsfönster",
  goToDay: "Gå till dag {day}",
  resetDemo: "Återställ demo",
  noWorkouts: "Inga pass ännu.",
  noEvents: "Inga händelser ännu.",
  dayLabel: "Dag {day}",
  notSelected: "Inte vald",
  yes: "Ja",
  no: "Nej",
  pushLine1: "Nästa pass börjar där det förra slutade.",
  pushLine2: "Fortsätt logga så kan Rytm börja visa din utveckling.",
};

const en: typeof sv = {
  navProduct: "Product",
  navInternal: "Internal",
  headlineLine1: "Your training.",
  headlineLine2: "Your progress.",
  frequencyQuestion: "How often do you usually train?",
  frequencyN: "{count} sessions / week",
  frequency5: "5+ sessions / week",
  weight: "Weight",
  reps: "Reps",
  saveWorkout: "Save workout",
  saving: "Saving",
  workoutSaved: "Workout saved.",
  firstPointSaved: "Your first data point is saved.",
  firstPointNext: "The next time you log the same exercise, Rytm can start comparing your training.",
  startNewWorkout: "Start new workout",
  lastTime: "Last time",
  previous: "Previous",
  now: "Now",
  sameWeight: "at the same weight",
  sameReps: "at the same reps",
  sameResult: "Same weight and reps",
  enterWeight: "Enter a weight",
  enterReps: "Enter reps",
  sessionFailed: "The session could not be started.",
  sessionFailedAnonymous:
    "Anonymous sign-in is disabled in the Supabase project. Enable Anonymous under Authentication → Providers.",
  somethingWrong: "Something went wrong",
  anonymousMissing: "Anonymous session is missing",
  userDataMissing: "User data is missing",
  frequencyMissing: "Training frequency is missing",
  workoutNotSaved: "The workout could not be saved",
  envMissing: "Supabase environment variables are missing",
  confirmGroup: "Switching group resets the demo for this user. Continue?",
  confirmReset: "Reset the demo for this user?",
  close: "Close",
  internalTitle: "Internal experiment view",
  user: "User",
  trainingData: "Training data",
  eventLog: "Event log",
  systemStatus: "System status",
  timeWindow: "Time window",
  testGroup: "Test group",
  controlGroup: "Control group",
  notificationsOn: "Notifications on",
  notificationsOff: "Notifications off",
  testLogic:
    "Initial test logic: 2 sessions/week means +3 days, 3 sessions/week +2 days, and 4 or 5 sessions/week +1 day from the first workout. This is not validated user behaviour.",
  kpiTitle: "First comparison within 14 days",
  kpiPending: "Pending",
  kpiAchieved: "Achieved",
  kpiMissed: "Not achieved",
  windowCommunicateTitle: "Day 0–7",
  windowCommunicateDetail: "Communication + observation",
  windowObserveTitle: "Day 7–14",
  windowObserveDetail: "Observation only",
  windowFinalTitle: "Day 14",
  windowFinalDetail: "Final measurement",
  advanceDay: "+1 day",
  nextWindow: "Go to next training window",
  goToDay: "Go to day {day}",
  resetDemo: "Reset demo",
  noWorkouts: "No workouts yet.",
  noEvents: "No events yet.",
  dayLabel: "Day {day}",
  notSelected: "Not selected",
  yes: "Yes",
  no: "No",
  pushLine1: "Your next workout starts where the last one ended.",
  pushLine2: "Keep logging so Rytm can start showing your progress.",
};

export type MessageKey = keyof typeof sv;

const translations: Record<Locale, typeof sv> = { sv, en };

const knownErrors: Record<string, MessageKey> = {
  "Anonym session saknas": "anonymousMissing",
  "Sessionen kunde inte startas": "sessionFailed",
  "Något gick fel": "somethingWrong",
  "Användardata saknas": "userDataMissing",
  "Ange en vikt": "enterWeight",
  "Ange repetitioner": "enterReps",
  "Träningsfrekvens saknas": "frequencyMissing",
  "Passet kunde inte sparas": "workoutNotSaved",
  "Supabase-miljövariabler saknas": "envMissing",
};

export function isLocale(value: string | null): value is Locale {
  return value === "sv" || value === "en";
}

export function serverLocale(): Locale {
  return "sv";
}

export function readLocale(): Locale {
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(stored) ? stored : "sv";
}

export function writeLocale(locale: Locale) {
  window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  window.dispatchEvent(new StorageEvent("storage", { key: LOCALE_STORAGE_KEY }));
}

export function subscribeLocale(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

export function t(locale: Locale, key: MessageKey) {
  return translations[locale][key];
}

export function tf(locale: Locale, key: MessageKey, vars: Record<string, string | number>) {
  return Object.entries(vars).reduce(
    (text, [name, value]) => text.replaceAll(`{${name}}`, String(value)),
    t(locale, key),
  );
}

export function translateKnownError(locale: Locale, message: string) {
  const key = knownErrors[message];
  return key ? t(locale, key) : message;
}
