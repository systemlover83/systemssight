/**
 * ============================================================
 *  EDIT THIS FILE TO CUSTOMIZE YOUR PAGE (or use /dev).
 *  Every "enabled" flag below is a toggle — flip it true/false.
 * ============================================================
 */
const CONFIG = {
  profile: {
    displayName: "system",
    handle: "@system",
    bio: "just the goat lowkey ",
    avatar: "assets/avatar.jpg",
    badges: [
      { icon: "⚡", label: "owner" }
    ]
  },

  theme: {
    accent: "#4dff00",
    accent2: "#000000",
    backgroundType: "video",
    backgroundMedia: "assets/bg.mp4",
    introAnimation: "fade"
  },

  socials: {
    discord   : { enabled: true, value: "System.mp3" },
    twitter   : { enabled: false, value: "" },
    instagram : { enabled: false, value: "" },
    tiktok    : { enabled: false, value: "" },
    github    : { enabled: false, value: "" },
    spotify   : { enabled: false, value: "" },
    youtube   : { enabled: false, value: "" },
    steam     : { enabled: true, value: "https://steamcommunity.com/profiles/76561199810897304/" },

    custom: [

    ]
  },

  features: {
    musicPlayer: { enabled: true, track: "assets/music.mp3", title: "song" },
    typewriterBio: { enabled: true },
    customCursor: { enabled: true },
    particleBackground: { enabled: true },
    viewCounter: { enabled: true, namespace: "systemlover-xyz-page" },
    pageLock: { enabled: false, passwordHash: "" }
  }
};
