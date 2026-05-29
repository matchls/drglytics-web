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
  "Phil is better now!",
  "Hinge, you piece of shit!",
  "Get to work, bitch.",
  "Ow!! I'm not a balloon!",
  "I smell bacon...",
  "I'm not a monster, ya dickhead!",
  "Can I have a Leaf Lover's Special?",
  "Roy. It stinks here.",
  "Rock and Stone... Yeeaaahhh!",
  "ROCK... AND... STONE!",
  "Did I hear a Rock and Stone?",
  "Leave No Dwarf Behind!",
  "Watch where you're shooting! Moron!",
  "Get back here you bastards!",
  "I've lived like a Dwarf, and I'm gonna die like a Dwarf!",
  "Well... Sometimes you win, sometimes you die!",
  "I think we actually have a chance to make it out alive!",
  "I'll beat your record this time - just watch me!",
  "Wonder what slop they're serving in the canteen tonight!",
  "That guy at mission control, he really has a cozy job!",
  "I'm having the best time in my life right now!",
  "Next time, let's go somewhere nice!",
  "Rock and Stone to the bone!",
  "Teamwork and beer will keep us together!",
  "I love this Grappling Hook!",
  "I'll drill through anything!",
  "Just show me where to shoot!",
  "Born to kill, baby!",
  "Time to light this shit up.",
];

// 3 phases : frappe → attente → sortie → frappe suivante
type Phase = "typing" | "waiting" | "exiting";

const TYPING_SPEED_MS = 100; // délai entre chaque caractère
const DISPLAY_DURATION_MS = 5000; // durée d'affichage après frappe complète
const EXIT_DURATION_MS = 700; // durée de la transition de sortie — doit correspondre au duration-[Xms] dans le JSX

export default function QuoteTypewriter() {
  const [quoteIndex, setQuoteIndex] = useState(() =>
    Math.floor(Math.random() * QUOTES.length),
  );
  const [displayedLength, setDisplayedLength] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const [exiting, setExiting] = useState(false);

  const quote = QUOTES[quoteIndex];

  // Phase "typing" : interval qui ajoute un caractère toutes les TYPING_SPEED_MS ms
  useEffect(() => {
    if (phase !== "typing") return;

    const id = setInterval(() => {
      setDisplayedLength((prev) => {
        if (prev >= quote.length) {
          clearInterval(id);
          setPhase("waiting");
          return prev;
        }
        return prev + 1;
      });
    }, TYPING_SPEED_MS);

    return () => clearInterval(id);
  }, [phase, quote]);

  // Phase "waiting" : on attend DISPLAY_DURATION_MS puis on déclenche la sortie
  useEffect(() => {
    if (phase !== "waiting") return;
    const id = setTimeout(() => {
      setExiting(true); // déclenche la transition CSS translateX
      setPhase("exiting");
    }, DISPLAY_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  // Phase "exiting" : on attend la fin de la transition, puis on passe à la citation suivante
  useEffect(() => {
    if (phase !== "exiting") return;
    const id = setTimeout(() => {
      setQuoteIndex((prev) => (prev + 1) % QUOTES.length);
      setDisplayedLength(0);
      setExiting(false);
      setPhase("typing");
    }, EXIT_DURATION_MS);
    return () => clearTimeout(id);
  }, [phase]);

  const displayedText = quote.slice(0, displayedLength);
  const isFullyTyped = displayedLength >= quote.length;

  return (
    // overflow-hidden nécessaire pour que le slide-out ne déborde pas du header

    <div className="flex-1 min-w-0 overflow-hidden mx-8 flex justify-center">
      <div
        // transition uniquement pendant la sortie — le retour à la position initiale est instantané
        className={
          exiting ? "transition-transform ease-in duration-[700ms]" : ""
        }
        style={{ transform: exiting ? "translateX(110%)" : "translateX(0)" }}
      >
        <p className="font-mono text-s text-drg-orange tracking-widest whitespace-nowrap">
          {/* Guillemet ouvrant fixe */}
          &ldquo;
          {/* Texte tapé caractère par caractère */}
          {displayedText}
          {/* Guillemet fermant apparaît seulement quand tout est tapé */}
          {isFullyTyped && !exiting && <>&rdquo;</>}
          {/* Curseur bloc — après la guillemet fermante, clignote quand frappe terminée */}
          {!exiting && (
            <span className={isFullyTyped ? "animate-pulse" : ""}>▌</span>
          )}
        </p>
      </div>
    </div>
  );
}
