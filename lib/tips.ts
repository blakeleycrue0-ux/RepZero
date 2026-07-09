const TIPS = [
  "Progressive overload doesn't mean more weight every session — one more rep at the same weight counts.",
  "Most people rest too little between heavy sets. 2–3 minutes for compound lifts is normal, not lazy.",
  "Protein timing matters far less than hitting your daily total. Spread it across meals and don't stress the window.",
  "Soreness fading faster each week is a better progress signal than the scale.",
  "A missed session doesn't undo a week of training. Consistency is measured in months, not days.",
  "Form breakdown on the last rep usually means the set ended one rep too late, not too early.",
  "Sleep is the cheapest recovery tool you have. Aim for consistency in bedtime before anything else.",
  "Cardio and lifting aren't in competition — most people under-recover from poor sleep, not from doing both.",
  "If a lift feels harder than usual, check sleep and food from the last 24 hours before assuming you're weak.",
  "Warm-up sets should feel easy. If your last warm-up set is grinding, drop the weight.",
] as const;

export function tipOfTheDay(date = new Date()): string {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86_400_000);
  return TIPS[dayOfYear % TIPS.length];
}
