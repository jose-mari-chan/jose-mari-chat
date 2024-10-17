let appId;
let appNickname;
export function getAppId() {
  if (appId == null) {
    appId = generateHexCode();
  }
  return appId;
}
export function getAppNickname() {
  if (appNickname == null) {
    appNickname = generateNickname();
  }
  return appNickname;
}
export function generateHexCode() {
  const hexCode = `m-${Math.floor(Math.random() * 16777215)
    .toString(16)
    .padStart(6, "0")}`;
  return hexCode;
}

// Function to generate a nickname in the format {adjective} {animal}
export function generateNickname() {
  const adjectives = [
    "Happy",
    "Sleepy",
    "Grumpy",
    "Silly",
    "Brave",
    "Clever",
    "Mighty",
    "Loyal",
    "Quick",
    "Shiny",
  ];
  const animals = [
    "Lion",
    "Tiger",
    "Bear",
    "Eagle",
    "Shark",
    "Dolphin",
    "Panda",
    "Wolf",
    "Fox",
    "Elephant",
  ];

  // Randomly select an adjective and an animal
  const randomAdjective =
    adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
  const nickname = `${randomAdjective} ${randomAnimal}`;
  return nickname;
}
export function getAppAvatar() {
  return `https://api.dicebear.com/9.x/fun-emoji/png?radius=20&seed=${getAppNickname()}`;
}
