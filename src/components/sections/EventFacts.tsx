import Image from "next/image";
import { siteConfig } from "@/config/site";

/**
 * Compact, minimalist event partners and organisers card.
 */
export function EventFacts() {
  const { organisers, supporters, promoters } = siteConfig;

  const heading =
    "eyebrow text-center text-ink-500";

  const logoStyle =
    "object-contain origin-center transition-transform duration-300 ease-out motion-safe:hover:scale-105";

  return (
    <section
      aria-label="Event partners and organisers"
      className="relative z-10 -mt-20 pb-10 sm:-mt-28 lg:-mt-32 md:pb-12"
    >
      <div className="container-site">
        <div
          className="
            relative mx-auto max-w-4xl
            overflow-hidden rounded-xl bg-white
            shadow-[0_20px_50px_-25px_rgb(14_14_16/0.25)]
            ring-1 ring-ink-900/5
          "
        >
          {/* Brand accent */}
          <div
            aria-hidden="true"
            className="bg-signature absolute inset-x-0 top-0 h-[3px]"
          />

          <dl>
            {/* TOP ROW — PROMOTED & SUPPORTED BY */}
            <div className="grid grid-cols-2">

              {/* PROMOTED BY */}
              <div
                className="
                  flex min-w-0 flex-col items-center
                  border-r border-sand-200
                  px-3 py-4
                  sm:px-6 sm:py-5
                "
              >
                <dt className={heading}>
                  Promoted by
                </dt>

                <dd
                  className="
                    mt-3 flex h-[84px]
                    w-full items-center justify-center
                    sm:h-[96px]
                  "
                >
                  {promoters.map((organisation) => (
                    <Image
                      key={organisation.name}
                      src={organisation.logo.src}
                      alt={organisation.name}
                      title={organisation.name}
                      width={organisation.logo.width}
                      height={organisation.logo.height}
                      sizes="(max-width: 639px) 90px, 104px"
                      className={`
                        ${logoStyle}
                        h-[80px] w-auto max-w-full
                        sm:h-[92px]
                      `}
                    />
                  ))}
                </dd>
              </div>

              {/* SUPPORTED BY */}
              <div
                className="
                  flex min-w-0 flex-col items-center
                  px-3 py-4
                  sm:px-6 sm:py-5
                "
              >
                <dt className={heading}>
                  Supported by
                </dt>

                <dd
                  className="
                    mt-3 flex h-[84px]
                    w-full items-center justify-center
                    gap-3
                    sm:h-[96px] sm:gap-7
                  "
                >
                  {supporters.map((organisation) => (
                    <div
                      key={organisation.name}
                      className="
                        relative aspect-square
                        w-[78px] min-w-0 shrink
                        sm:w-[90px]
                      "
                    >
                      <Image
                        src={organisation.logo.src}
                        alt={organisation.name}
                        title={organisation.name}
                        fill
                        sizes="(max-width: 639px) 78px, 90px"
                        className={logoStyle}
                      />
                    </div>
                  ))}
                </dd>
              </div>
            </div>

            {/* BOTTOM ROW — ORGANISED BY */}
            <div
              className="
                flex flex-col items-center
                border-t border-sand-200
                px-5 py-4
                sm:px-8 sm:py-5
              "
            >
              <dt className={heading}>
                Organised by
              </dt>

              <dd
                className="
                  mx-auto mt-3
                  grid w-full max-w-[400px]
                  grid-cols-2 items-center
                  gap-5 sm:gap-8
                "
              >
                {organisers.map((organisation) => (
                  <div
                    key={organisation.name}
                    className="
                      relative mx-auto
                      h-[40px] w-full min-w-0
                      max-w-[180px]
                      sm:h-[48px]
                    "
                  >
                    <Image
                      src={organisation.logo.src}
                      alt={organisation.name}
                      title={organisation.name}
                      fill
                      sizes="(max-width: 639px) 45vw, 235px"
                      className={`
                        object-contain
                        origin-center
                        transition-transform
                        duration-300 ease-out
                        ${
                          organisation.shortName === "Media Space"
                            ? "scale-[1.30] motion-safe:hover:scale-[1.35]"
                            : "motion-safe:hover:scale-105"
                        }
                      `}
                    />
                  </div>
                ))}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}