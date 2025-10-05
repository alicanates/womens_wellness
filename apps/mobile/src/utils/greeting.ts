/**
 * Get time-based greeting in Turkish
 * @returns Greeting text based on current hour
 */
export function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Günaydın';
  } else if (hour >= 12 && hour < 17) {
    return 'İyi günler';
  } else if (hour >= 17 && hour < 22) {
    return 'İyi akşamlar';
  } else {
    return 'İyi geceler';
  }
}

/**
 * Get a friendly greeting message with emoji
 * @param name User's name
 * @returns Complete greeting message
 */
export function getGreetingMessage(name: string): string {
  const greeting = getTimeBasedGreeting();
  const hour = new Date().getHours();

  let emoji = '☀️';
  if (hour >= 5 && hour < 12) {
    emoji = '🌸';
  } else if (hour >= 12 && hour < 17) {
    emoji = '🌺';
  } else if (hour >= 17 && hour < 22) {
    emoji = '🌙';
  } else {
    emoji = '✨';
  }

  return `${emoji} ${greeting}, ${name}`;
}
