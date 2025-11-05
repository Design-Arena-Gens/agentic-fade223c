import Link from "next/link";
import { fetchAggregatedOffers } from "@/lib/aggregator";
import styles from "./page.module.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const timestampFormatter = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "medium",
  timeZone: "Asia/Kolkata",
});

export default async function Home() {
  const aggregated = await fetchAggregatedOffers();

  const successfulSources = aggregated.sources.filter(
    (source) => source.status === "ok" && source.offers.length,
  );

  const erroredSources = aggregated.sources.filter(
    (source) => source.status === "error" || !source.offers.length,
  );

  const lastUpdatedTimestamp = aggregated.sources
    .map((source) => Date.parse(source.fetchedAt))
    .filter((value) => Number.isFinite(value))
    .sort((a, b) => b - a)
    .at(0);

  const lastUpdated =
    typeof lastUpdatedTimestamp === "number"
      ? timestampFormatter.format(new Date(lastUpdatedTimestamp))
      : null;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <p className={styles.badge}>Price Intelligence</p>
            <h1>Cheapest IFB 9&nbsp;kg Washing Machines (India)</h1>
            <p className={styles.subtitle}>
              Live scrape across major e-commerce storefronts. Data refreshes on
              each page load; pricing is reported in Indian Rupees.
            </p>
          </div>
          <div className={styles.meta}>
            <span className={styles.metaLabel}>Last checked</span>
            <span className={styles.metaValue}>
              {lastUpdated ?? "Awaiting data"}
            </span>
          </div>
        </header>

        <section className={styles.highlight}>
          {aggregated.cheapest ? (
            <>
              <div>
                <span className={styles.highlightLabel}>Current lowest</span>
                <h2>{aggregated.cheapest.name}</h2>
                <div className={styles.priceRow}>
                  <span className={styles.highlightPrice}>
                    {currencyFormatter.format(aggregated.cheapest.price)}
                  </span>
                  <span className={styles.highlightSource}>
                    {aggregated.cheapest.source}
                  </span>
                </div>
                <p className={styles.fetchedAt}>
                  Pulled&nbsp;
                  {timestampFormatter.format(
                    new Date(aggregated.cheapest.fetchedAt),
                  )}
                </p>
              </div>
              <Link
                href={aggregated.cheapest.productUrl}
                className={styles.highlightCta}
                target="_blank"
                rel="noopener noreferrer"
              >
                View listing
              </Link>
            </>
          ) : (
            <div>
              <h2>Unable to surface live prices</h2>
              <p className={styles.subtitle}>
                No qualifying IFB 9&nbsp;kg washing machines were returned by
                the marketplaces at this time.
              </p>
            </div>
          )}
        </section>

        <section className={styles.grid}>
          {successfulSources.map((source) => (
            <article key={source.source} className={styles.card}>
              <header className={styles.cardHeader}>
                <h3>{source.source}</h3>
                <span className={styles.cardTimestamp}>
                  {timestampFormatter.format(new Date(source.fetchedAt))}
                </span>
              </header>
              <ul className={styles.offerList}>
                {source.offers.map((offer) => (
                  <li key={offer.productUrl} className={styles.offerItem}>
                    <div>
                      <p className={styles.offerName}>{offer.name}</p>
                      <p className={styles.offerMeta}>
                        Updated&nbsp;
                        {timestampFormatter.format(new Date(offer.fetchedAt))}
                      </p>
                    </div>
                    <div className={styles.offerActions}>
                      <span className={styles.offerPrice}>
                        {currencyFormatter.format(offer.price)}
                      </span>
                      <Link
                        href={offer.productUrl}
                        className={styles.offerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Open
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        {erroredSources.length ? (
          <section className={styles.issues}>
            <h2>Sources with issues</h2>
            <ul>
              {erroredSources.map((source) => (
                <li key={source.source}>
                  <span className={styles.issueSource}>{source.source}</span>
                  <span className={styles.issueMessage}>
                    {source.error ?? "Unavailable"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </div>
  );
}
