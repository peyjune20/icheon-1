import { ExcludedPlace } from "@/domain/models/itinerary";

interface ExcludedPlacesCardProps {
  excludedPlaces: ExcludedPlace[];
}

export const ExcludedPlacesCard = ({ excludedPlaces }: ExcludedPlacesCardProps) => {
  if (!excludedPlaces || excludedPlaces.length === 0) return null;

  return (
    <section className="rounded-xl bg-surface-container-low p-space-md mb-space-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[20px] text-secondary">
            bookmark_added
          </span>
          <h2 className="font-headline text-headline-md text-on-surface font-bold">
            오늘은 다음으로 남겨둘게요
          </h2>
        </div>
        <span className="text-label-sm text-secondary font-medium">
          {excludedPlaces.length}곳 제외
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {excludedPlaces.map(({ place, tag, reason }) => (
          <div
            key={place.id}
            className="p-3 rounded-lg bg-surface-container-lowest shadow-xs flex flex-col gap-1 border border-outline-variant/20"
          >
            <div className="flex items-center justify-between">
              <span className="text-label-lg text-on-surface font-bold">
                {place.name}
              </span>
              <span
                className={`text-label-sm px-2 py-0.5 rounded font-medium ${
                  tag.includes("폭염")
                    ? "text-tertiary bg-tertiary-fixed"
                    : "text-secondary bg-secondary-container"
                }`}
              >
                {tag}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant leading-normal">
              {reason}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};
