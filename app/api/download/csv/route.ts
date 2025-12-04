import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from "firebase/firestore";
import { parse as jsonToCsv } from "json2csv";
import { type NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const state = searchParams.get("state")?.toLowerCase();

  if (!state) {
    return NextResponse.json(
      { error: "State parameter is required" },
      { status: 400 },
    );
  }

  // Get filter parameters
  const textQuery = searchParams.get("query") || "";
  const agency = searchParams.get("agency") || "";
  const startDateParam = searchParams.get("startDate");
  const endDateParam = searchParams.get("endDate");
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";
  const startDate = startDateParam ? new Date(startDateParam) : null;
  const endDate = endDateParam ? new Date(endDateParam) : null;

  try {
    // Query Firestore
    const officersRef = collection(db, "db_launch");
    let q = query(officersRef, where("state", "==", state));

    // Apply filters
    if (textQuery) {
      // For simplicity, we're assuming there's a text search capability
      // In a real implementation, you might need to use a more complex approach or a dedicated search service
      q = query(
        q,
        where("searchable_text", "array-contains", textQuery.toLowerCase()),
      );
    }

    if (agency) {
      q = query(q, where("agency_name", "==", agency));
    }

    if (startDate) {
      q = query(q, where("start_date", ">=", startDate.toISOString()));
    }

    if (endDate) {
      q = query(q, where("end_date", "<=", endDate.toISOString()));
    }

    // Apply sorting
    if (sortBy === "name") {
      q = query(q, orderBy("last_name", sortOrder === "desc" ? "desc" : "asc"));
    } else if (sortBy === "date") {
      q = query(
        q,
        orderBy("start_date", sortOrder === "desc" ? "desc" : "asc"),
      );
    } else if (sortBy === "agency") {
      q = query(
        q,
        orderBy("agency_name", sortOrder === "desc" ? "desc" : "asc"),
      );
    }

    // Limit to reasonable size for download (can be adjusted)
    q = query(q, limit(10000));

    const snapshot = await getDocs(q);

    // Process the results
    const officers = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        first_name: data.first_name || "",
        middle_name: data.middle_name || "",
        last_name: data.last_name || "",
        person_nbr: data.person_nbr || "",
        agency_name: data.agency_name || "",
        start_date: data.start_date || "",
        end_date: data.end_date || "",
        state: data.state || "",
        document_id: data.document_id || "",
      };
    });

    // Convert to CSV
    const csv = jsonToCsv(officers);

    // Return as a downloadable file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="${state}-filtered.csv"`,
      },
    });
  } catch (error) {
    console.error("Error generating CSV:", error);
    return NextResponse.json(
      { error: "Failed to generate CSV" },
      { status: 500 },
    );
  }
}
