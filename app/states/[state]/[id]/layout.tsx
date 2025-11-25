import { Metadata } from "next";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { US_STATES } from "@/constants/states";

type Props = Promise<{ children: React.ReactNode; id: string; state: string }>;

export async function generateMetadata({
  params,
}: {
  params: Props;
}): Promise<Metadata> {
  const { id, state } = await params;
  // Decode the agency ID from the URL
  const decodedAgencyId = decodeURIComponent(id);
  let agencyName = decodedAgencyId; // Default to the ID if we can't fetch the name
  let officerCount = 0;
  let stateName = "";

  const stateData = US_STATES.find((s) => s.reference === state);
  if (stateData?.name) {
    stateName = stateData?.name;
  }

  try {
    // Try to get agency stats from Firestore
    const statsQuery = query(
      collection(db, "statistics_per_agency"),
      where("name", "==", agencyName),
      where("state", "==", state)
    );
    const statsSnapshot = await getDocs(statsQuery);

    if (!statsSnapshot.empty) {
      const agencyData = statsSnapshot.docs[0].data();

      if (agencyData?.name) {
        agencyName = agencyData.name;
      }
      // Get officer count if available
      if (agencyData?.stats) {
        const officerStats = agencyData.stats.find(
          (stat: any) => stat.label === "Total Officers"
        );
        if (officerStats) {
          officerCount = parseInt(officerStats.value, 10);
        }
      }
    }
  } catch (error) {
    console.error("Error fetching agency data for metadata:", error);
  }

  // Include state in title for better analytics tracking
  const title = stateName
    ? `${stateName} / ${agencyName} Police Department | National Police Index`
    : `${agencyName} Police Department | National Police Index`;

  const description = officerCount
    ? `View ${officerCount} police officers at ${agencyName}${
        stateName ? ` in ${stateName}` : ""
      }. Search employment records, certification status, and disciplinary actions.`
    : `View police officers at ${agencyName}${
        stateName ? ` in ${stateName}` : ""
      }. Search employment records, certification status, and disciplinary actions.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      title,
      description,
    },
  };
}

export default function AgencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
