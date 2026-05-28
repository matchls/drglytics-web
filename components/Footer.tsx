"use client";

import { useEffect, useState } from "react";

const QUOTES = [
  "If you don't Rock and Stone, you ain't comin' home!",
  "You leaf-fondling son of a mud golem! We're on the same team!",
  "I'm on your side, ya mangy pecker!",
  "It's me, you drunk bastard!",
  "Could you lazy bastards get me the fuck up?!",
  "You got a certain 'flare' with that gun, haha!",
  "Ey, easy on the C4, yeah?",
  "I hate nature.",
  "Go lie down foreverrr!",
  "You spit acid? Well, I spit bullets! Ha!",
  "Free hugs? What about free bullets!? Hahahaha!",
  "You lose, big boy!",
  "If only my real job was as easy as playing a video game...",
  "I almost feel bad putting this on a weapon... aaalmost!",
  "There is no breast tissue that has not been removed!",
  "You are aware of your pregnancy.",
  "It's not worth it, but it's really interesting!",
  "Phil is better now!",
  "Hinge, you piece of shit!",
  "Get to work, bitch.",
  "I guess he didn't care enough!",
  "Ow!! I'm not a balloon!",
  "I smell bacon...",
  "I'm not a monster, ya dickhead!",
  "Can I have a Leaf Lover's Special?",
  "Troll style!",
  "Roy. It stinks here.",
  "Rock and Stone... Yeeaaahhh! ",
  "ROCK... AND... STONE! ",
  "Did I hear a Rock and Stone? ",
  "Leave No Dwarf Behind! ",
  "Oops I slipped! ",
  "Watch where you're shooting! Moron! ",
  "Get back here you bastards!",
  "Okay, this is not happening!",
  "Don't leave me!",
  "Damn you Deep Rock Galactic!",
  "I've lived like a Dwarf, and I'm gonna die like a Dwarf!",
  "Buggers!",
  "Damn! That's unfortunate!",
  "Well... Sometimes you win, sometimes you die!",
  "Game over boys!",
  "Game over lads!",
  "Oh shit!",
  "This is it boys!",
  "This is it lads!",
  "We were so close - damn it!",
  "I think we actually have a chance to make it out alive!",
  "Maybe we're not gonna die after all!",
  "I actually think we're gonna make it!",
  "I'll beat your record this time - just watch me!",
  "Wonder what slop they're serving in the canteen tonight!",
  "This place is almost nice compared to last time!",
  "This is a friggin' hell hole!",
  "God dammit, there's a pebble in my boot!",
  "I think we're actually doing alright so far!",
  "That guy at mission control, he really has a cozy job!",
  "I'm wondering if fighting bugs and moving dirt is the best way to make a living.",
  "I'm having the best time in my life right now!",
  "Next time, let's go somewhere nice!",
  "Molly! Come here!",
  "Molly is on the way!",
  "Donkey! Come here!",
  "Deep Rock seriously need to invest in some better equipment!",
  "Depositing minerals!",
  "Let's follow the M.U.L.E., it's heading for the drop pod!",
  "I ordered a resupply!",
  "Resupply pod is here! Everybody collect ammunition.",
  "Help, it took me!",
  "Stupid bug! Put me down!",
  "Help! I'm stuck in the ceiling!",
  "I'm trapped!",
  "I can't feel my beard, help!",
  "Rock and Stone to the bone!",
  "Teamwork and beer will keep us together!",
  "Hello darkness, my old friend, Karl would approve of this.",
  "Zippity!",
  "See ya, suckers!",
  "I love this Grappling Hook!",
  "Thing's about to go boom!",
  "I'll drill through anything!",
  "Ain't no obstacle I can't clear!",
  "Let me handle the digging!",
  "I eat rock for breakfast!",
  "Digging's my middle name!",
  "Just show me where to shoot!",
  "Born to kill, baby!",
  "Time to light this shit up.",
];

export default function Footer() {
  const [time, setTime] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    // Horloge — mise à jour chaque seconde
    const tick = () => setTime(new Date().toLocaleTimeString("fr-FR"));
    tick();
    const clockId = setInterval(tick, 1000);

    // Citation — index aléatoire au départ, puis rotation toutes les 10s
    setQuoteIndex(Math.floor(Math.random() * QUOTES.length));
    const quoteId = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
    }, 10000);

    return () => {
      clearInterval(clockId);
      clearInterval(quoteId);
    };
  }, []);

  return (
    <footer className="font-mono text-xs tracking-widest bg-surface-container border-t border-drg-border">
      {/* Bande haute — citation rotative */}
      <div className="px-4 py-1 border-b border-drg-border text-drg-orange text-center">
        &ldquo;{QUOTES[quoteIndex]}&rdquo;
      </div>

      {/* Bande basse — copyright + horloge */}
      <div className="flex justify-between px-4 py-1 text-on-surface-variant opacity-60">
        <span>© DEEP ROCK GALACTIC — PROPERTY OF MANAGEMENT</span>
        <span className="text-drg-orange opacity-100">{time}</span>
      </div>
    </footer>
  );
}
