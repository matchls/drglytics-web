import { OverclocksData } from "@/lib/types";
import { CLASS_NAMES, CLASS_COLORS } from "@/lib/types";

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
                className="bg-drg-panel border border-drg-orange rounded p-2"
              >
                <p className="font-bold text-sm text-drg-orange">{oc.name}</p>
                <p className="text-gray-400 text-xs">{oc.weapon}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
