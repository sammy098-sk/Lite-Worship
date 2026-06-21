/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ServiceItem, WorshipSong } from "./types";

export const DEFAULT_SERVICE_FLOW: ServiceItem[] = [
  {
    id: "item-1",
    title: "Welcome & Announcements",
    duration: "5 min",
    status: "completed",
    notes: "Welcoming regular congregation and visitors. Show Lite Worship logo on slides.",
    slides: [
      { text: "Welcome to Lite Worship Church\nHouse of Peace & Love" },
      { text: "Today's Announcements\n• Youth Gathering: Wednesday at 7 PM\n• Community Outreach: Saturday 9 AM" }
    ]
  },
  {
    id: "item-2",
    title: "Worship Session",
    duration: "15 min",
    status: "active",
    notes: "Lead vocals: Sarah. Play 'Goodness of God' then transition to 'Way Maker'. Keep background warm and ambient.",
    slides: [
      { text: "I love You, Lord\nFor Your mercy never fails me" }
    ]
  },
  {
    id: "item-3",
    title: "Scripture Reading",
    duration: "5 min",
    status: "pending",
    notes: "Reading from Matthew 6:25-34. Reader: Elder Joseph.",
    slides: [
      { text: "Therefore I tell you, do not be anxious about your life,\nwhat you will eat or what you will drink..." }
    ]
  },
  {
    id: "item-4",
    title: "Sermon: Living with Faith",
    duration: "30 min",
    status: "pending",
    notes: "Speaker: Pastor David. AI sermon parsing is active. Capture raw references automatically.",
    slides: [
      { text: "Living with Faith & Courage\nPastor David" },
      { text: "Hebrews 11:1\nNow faith is the assurance of things hoped for,\nthe conviction of things not seen." }
    ]
  },
  {
    id: "item-5",
    title: "Offering & Communion",
    duration: "10 min",
    status: "pending",
    notes: "Soft backing instrumental during prayer. Display giving details.",
    slides: [
      { text: "Giving & Generosity\nMalachi 3:10" },
      { text: "Online Giving: liteworship.org/give\nText 'GIVE' to (555) 123-4567" }
    ]
  },
  {
    id: "item-6",
    title: "Closing & Benediction",
    duration: "5 min",
    status: "pending",
    notes: "Final blessing. Invite everyone for fellowship and coffee in the lobby.",
    slides: [
      { text: "Go in peace to love and serve the Lord.\nAmen." }
    ]
  }
];

export const WORSHIP_SONGS: WorshipSong[] = [
  {
    id: "song-1",
    title: "Amazing Grace",
    author: "John Newton",
    slides: [
      ["Amazing grace! How sweet the sound", "That saved a wretch like me!", "I once was lost, but now am found", "Was blind, but now I see."],
      ["'Twas grace that taught my heart to fear", "And grace my fears relieved;", "How precious did that grace appear", "The hour I first believed!"],
      ["Through many dangers, toils and snares", "I have already come;", "This grace hath brought me safe thus far", "And grace will lead me home."],
      ["When we've been there ten thousand years", "Bright shining as the sun", "We've no less days to sing God's praise", "Than when we first begun."]
    ]
  },
  {
    id: "song-2",
    title: "Goodness of God",
    author: "Bethel Worship",
    slides: [
      ["I love You Lord", "Oh Your mercy never fails me", "All my days", "I've been held in Your hands"],
      ["From the moment that I wake up", "Until I lay my head", "I will sing of the goodness of God"],
      ["[Chorus]", "Cause all my life You have been faithful", "And all my life You have been so so good", "With every breath that I am able", "Oh I will sing of the goodness of God"],
      ["I love Your voice", "You have led me through the fiery furnace", "In darkest night", "You are close like no other"],
      ["I've known You as a father", "I've known You as a friend", "I have lived in the goodness of God"]
    ]
  },
  {
    id: "song-3",
    title: "Way Maker",
    author: "Sinach",
    slides: [
      ["You are here, moving in our midst", "I worship You, I worship You", "You are here, working in this place", "I worship You, I worship You"],
      ["[Chorus]", "Way maker, Miracle worker", "Promise keeper, Light in the darkness", "My God, that is who You are"],
      ["You are here, touching every heart", "I worship You, I worship You", "You are here, healing every heart", "I worship You, I worship You"],
      ["Even when I don't see it, You're working", "Even when I don't feel it, You're working", "You never stop, You never stop working"]
    ]
  },
  {
    id: "song-4",
    title: "10,000 Reasons (Bless the Lord)",
    author: "Matt Redman",
    slides: [
      ["[Chorus]", "Bless the Lord, O my soul, O my soul", "Worship His holy name", "Sing like never before, O my soul", "I'll worship Your holy name"],
      ["The sun comes up, it's a new day dawning", "It's time to sing Your song again", "Whatever may pass, and whatever lies before me", "Let me be singing when the evening comes"],
      ["You're rich in love, and You're slow to anger", "Your name is great, and Your heart is kind", "For all Your goodness I will keep on singing", "Ten thousand reasons for my heart to find"]
    ]
  },
  {
    id: "song-5",
    title: "How Great Is Our God",
    author: "Chris Tomlin",
    slides: [
      ["The splendor of a King, clothed in majesty", "Let all the earth rejoice, all the earth rejoice", "He wraps Himself in light, and darkness tries to hide", "And trembles at His voice, trembles at His voice"],
      ["[Chorus]", "How great is our God, sing with me", "How great is our God, and all will see", "How great, how great is our God"],
      ["Age to age He stands, and time is in His hands", "Beginning and the end, beginning and the end", "The Godhead, three in one: Father, Spirit, Son", "The Lion and the Lamb, the Lion and the Lamb"]
    ]
  }
];

export const KNOWN_SCRIPTURES = [
  {
    reference: "John 3:16",
    text: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life."
  },
  {
    reference: "Psalm 23:1",
    text: "The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters."
  },
  {
    reference: "Psalm 23:4",
    text: "Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me; your rod and your staff, they comfort me."
  },
  {
    reference: "Matthew 6:33",
    text: "But seek first the kingdom of God and his righteousness, and all these things will be added to you."
  },
  {
    reference: "Romans 8:28",
    text: "And we know that for those who love God all things work together for good, for those who are called according to his purpose."
  },
  {
    reference: "Philippians 4:13",
    text: "I can do all things through him who strengthens me."
  },
  {
    reference: "Proverbs 3:5-6",
    text: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths."
  },
  {
    reference: "Matthew 6:12",
    text: "And forgive us our debts, as we also have forgiven our debtors."
  }
];
