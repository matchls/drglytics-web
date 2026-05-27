import { OverclocksData } from "@/lib/types";
import { CLASS_NAMES } from "@/lib/types";
import { WEAPON_ICONS } from "@/lib/weaponIcons";
import Image from "next/image";

interface Props {
  overclocks: OverclocksData;
}

export default function OverclockList({ overclocks }: Props) {
  const totalForged = overclocks.forged_count;

  return (
    <div className="industrial-panel flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b-4 border-outline flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">
          construction
        </span>
        <p className="font-display text-xl text-on-surface tracking-widest">
          FORGE STATUS
        </p>
      </div>

      {/* Liste scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {CLASS_NAMES.map((className) =>
          overclocks.forged_by_dwarf[className]?.map((oc) => (
            <div
              key={oc.guid}
              className="flex items-center gap-3 bg-surface-container-highest border border-outline p-2"
            >
              {WEAPON_ICONS[oc.weapon] && (
                <Image
                  src={WEAPON_ICONS[oc.weapon]}
                  alt={oc.weapon}
                  width={36}
                  height={36}
                  className="opacity-80"
                />
              )}
              <div>
                <p className="font-mono text-sm text-on-surface">{oc.name}</p>
                <p className="font-mono text-xs text-on-surface-variant">
                  {oc.weapon}
                </p>
              </div>
            </div>
          )),
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t-4 border-outline">
        <p className="font-mono text-xs text-on-surface-variant tracking-widest">
          TOTAL FORGED: {totalForged} / AVAILABLE SLOTS: ∞
        </p>
      </div>
    </div>
  );
}
