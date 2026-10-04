import type { HeistType } from "@/data/heists";

/** <option>s for the heist catalog, grouped by game. */
export function HeistTypeOptions({ heistTypes }: { heistTypes: HeistType[] }) {
  const gta6 = heistTypes.filter((h) => h.game === "gta6");
  const online = heistTypes.filter((h) => h.game === "gta-online");
  return (
    <>
      {gta6.length > 0 && (
        <optgroup label="GTA 6">
          {gta6.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name}
            </option>
          ))}
        </optgroup>
      )}
      {online.length > 0 && (
        <optgroup label="GTA Online">
          {online.map((h) => (
            <option key={h.slug} value={h.slug}>
              {h.name}
            </option>
          ))}
        </optgroup>
      )}
    </>
  );
}
