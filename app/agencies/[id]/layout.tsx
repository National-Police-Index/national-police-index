import { Metadata } from "next";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
} from "firebase/firestore";

type Props = Promise<{ children: React.ReactNode; id: string }>;

export async function generateMetadata({
  params,
}: {
  params: Props;
}): Promise<Metadata> {
  const { id } = await params;
  // Decode the agency ID from the URL
  const decodedAgencyId = decodeURIComponent(id);
  let agencyName = decodedAgencyId; // Default to the ID if we can't fetch the name
  let officerCount = 0;
  let stateName = "";

  try {
    // Try to get agency stats from Firestore
    const agencyId = decodedAgencyId
      .toLowerCase()
      .replace(/[/\\]/g, "%2F")
      .replace(/[^a-z0-9-]/g, "-");

    const statsRef = doc(db, "statistics_per_agency", agencyId);
    const statsDoc = await getDoc(statsRef);

    if (statsDoc.exists()) {
      const agencyData = statsDoc.data();
      // Use the agency name from stats if available

      if (agencyData?.name) {
        agencyName = agencyData.name;
      }

      // Get state information
      if (agencyData?.state) {
        stateName =
          agencyData.state.charAt(0).toUpperCase() + agencyData.state.slice(1);
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
