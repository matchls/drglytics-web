import { OverclocksData } from "@/lib/types";
import { CLASS_NAMES, CLASS_COLORS } from "@/lib/types";
import { WEAPON_ICONS } from "@/lib/weaponIcons";
import Image from "next/image";

interface Props {
  overclocks: OverclocksData;
}

export default function OverclockList({ overclocks }: Props) {
  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold uppercase tracking-widest text-drg-orange mb-4">
        Overclocks forgés ({overclocks.forged_count})
      </h2>
      {CLASS_NAMES.map((className) => (
        <div key={className} className="mb-6">
          <h3
            className="text-xl font-bold uppercase tracking-widest mb-2"
            style={{ color: CLASS_COLORS[className] }}
          >
            {className}
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {overclocks.forged_by_dwarf[className]?.map((oc) => (
              <div
                key={oc.guid}
                className="bg-drg-panel border border-drg-border rounded p-2 flex items-center gap-3"
              >
                {WEAPON_ICONS[oc.weapon] && (
                  <Image
                    src={WEAPON_ICONS[oc.weapon]}
                    alt={oc.weapon}
                    width={90}
                    height={90}
                    className="opacity-80"
                  />
                )}
                <div>
                  <p className="font-bold text-sm">{oc.name}</p>
                  <p className="text-gray-400 text-xs">{oc.weapon}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
