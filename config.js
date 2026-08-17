/**
 * ============================================================
 *  EDIT THIS FILE TO CUSTOMIZE YOUR PAGE.
 *  You almost never need to touch index.html / style.css / script.js.
 *  Every "enabled" flag below is a toggle — flip it true/false.
 * ============================================================
 */
const CONFIG = {
  profile: {
    displayName: "systemlover",
    handle: "@systemlover",
    bio: "building weird things on the internet",
    // Path to your avatar image, e.g. "assets/avatar.jpg". Leave as-is to use the placeholder.
    avatar: "assets/avatar-placeholder.svg",
    // Small pills under your name. Add/remove freely, or leave empty: []
    badges: [
      { icon: "⚡", label: "owner" }
    ]
  },

  theme: {
    // Any CSS colors work here.
    accent: "#a855f7",   // primary neon color
    accent2: "#22d3ee",  // secondary neon color (gradients / particles)

    // "particles" | "image" | "video" | "solid"
    backgroundType: "particles",
    // Only used when backgroundType is "image" or "video". e.g. "assets/bg.mp4"
    backgroundMedia: ""
  },

  socials: {
    // value = username, invite code, or full URL depending on platform — see README.
    discord:   { enabled: false, value: "" },   // e.g. invite code "abc123" or "username"
    twitter:   { enabled: false, value: "" },   // e.g. "yourhandle"
    instagram: { enabled: false, value: "" },   // e.g. "yourhandle"
    tiktok:    { enabled: false, value: "" },   // e.g. "yourhandle"
    github:    { enabled: false, value: "" },   // e.g. "yourusername"
    spotify:   { enabled: false, value: "" },   // full profile URL
    youtube:   { enabled: false, value: "" },   // full channel URL
    steam:     { enabled: false, value: "" },   // full profile URL

    // Freeform extra links. Add as many as you want.
    // icon: "link" | "music" | "play" | "controller"
    custom: [
      // { enabled: true, label: "My Website", url: "https://systemlover.xyz", icon: "link" }
    ]
  },

  features: {
    // Click-to-play background track (browsers block true autoplay with sound).
    musicPlayer: { enabled: false, track: "assets/music.mp3", title: "track name" },

    // Typewriter animation on the bio line instead of a simple fade-in.
    typewriterBio: { enabled: true },

    // Custom glowing cursor (auto-disabled on touch devices).
    customCursor: { enabled: true },

    // Animated connected-dot particle background.
    particleBackground: { enabled: true },

    // Visit counter. Uses a free public counter API with a local fallback
    // if that service is unreachable, so it never breaks the page.
    viewCounter: { enabled: true, namespace: "systemlover-xyz-page" }
  }
};
