import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { PoliceOfficer } from '@/types';
import React from 'react';
import { renderToStream } from '@react-pdf/renderer';
import { OfficerProfilePDF } from '@/components/pdf/OfficerProfilePDF';
import { Readable } from 'stream';

type PoliceOfficerWithEventType = PoliceOfficer & {
  eventType: "Start" | "End" | "Discipline";
  startDate?: Date;
  endDate?: Date;
  agency?: string;
  offense?: string;
  sanction?: string;
  separation_reason?: string;
  rank?: string;
  sanction_date?: string;
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const personNbr = searchParams.get('personNbr');

  if (!personNbr) {
    return NextResponse.json({ error: 'personNbr parameter is required' }, { status: 400 });
  }

  try {
    // Query Firestore for officer records
    const officersRef = collection(db, 'db_launch');
    const q = query(officersRef, where('person_nbr', '==', personNbr));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return NextResponse.json({ error: 'Officer not found' }, { status: 404 });
    }

    const records: PoliceOfficer[] = snapshot.docs.map(doc => doc.data() as PoliceOfficer);
    const latestRecord = records.reduce((latest, record) => {
      const latestDate = new Date(latest.start_date || 0);
      const currentDate = new Date(record.start_date || 0);
      return currentDate > latestDate ? record : latest;
    }, records[0]);

    const fullName = latestRecord.full_name ||
      (latestRecord.last_name || latestRecord.middle_name) +
      ((latestRecord.last_name || latestRecord.middle_name) && ", ") +
      latestRecord.first_name;

    // Process timeline data (same logic as in the page component)
    const timeline = processTimelineData(records);

    // Generate PDF
    const pdfStream = await renderToStream(
      React.createElement(OfficerProfilePDF, {
        fullName,
        personNbr,
        timeline
      })
    );

    // Convert Node.js stream to buffer
    const chunks: Buffer[] = [];
    const nodeStream = pdfStream as unknown as Readable;

    for await (const chunk of nodeStream) {
      chunks.push(Buffer.from(chunk));
    }

    const pdfBuffer = Buffer.concat(chunks);

    // Return PDF as downloadable file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="officer-${personNbr}-profile.pdf"`
      }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

/**
 * Process timeline data from records
 */
function processTimelineData(records: PoliceOfficer[]): { [year: string]: PoliceOfficerWithEventType[] } {
  const safeFormatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    try {
      return date.toISOString();
    } catch (exception) {
      console.error("Error converting date to ISO string:", exception);
      return "";
    }
  };

  const createEventObject = (
    record: PoliceOfficer,
    eventType: "Start" | "End" | "Discipline",
    dateString: string
  ): PoliceOfficerWithEventType => {
    const isDiscipline =
      record.state.endsWith("iscipline") && (record.offense || record.sanction);

    return {
      ...record,
      agency_name: record.agency_name,
      eventType: isDiscipline ? "Discipline" : eventType,
      ...(eventType === "Start" && { start_date: dateString }),
      ...(eventType === "End" && { end_date: dateString }),
      ...(eventType === "Discipline" && { sanction_date: dateString }),
      rank: record.rank || record.certification_type || record.type,
      offense: record.offense || record.sanction,
      separation_reason: record.separation_reason,
      violation: record.violation,
    } as PoliceOfficerWithEventType;
  };

  const areDuplicateEvents = (
    existingEvent: PoliceOfficerWithEventType,
    newEvent: PoliceOfficerWithEventType
  ): boolean => {
    if (
      existingEvent.eventType === "Discipline" &&
      newEvent.eventType === "Discipline"
    ) {
      if (existingEvent.agency_name !== newEvent.agency_name) {
        return false;
      }

      const existingOffense = existingEvent.offense || "";
      const newOffense = newEvent.offense || "";
      if (
        existingOffense &&
        newOffense &&
        (existingOffense.includes(newOffense) ||
          newOffense.includes(existingOffense))
      ) {
        return true;
      }

      const existingSeparation = existingEvent.separation_reason || "";
      const newSeparation = newEvent.separation_reason || "";
      if (
        existingSeparation &&
        newSeparation &&
        (existingSeparation.includes(newSeparation) ||
          newSeparation.includes(existingSeparation))
      ) {
        return true;
      }

      if (existingEvent.sanction_date && newEvent.sanction_date) {
        const date1 = new Date(existingEvent.sanction_date);
        const date2 = new Date(newEvent.sanction_date);
        const diffDays = Math.abs(
          (date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays <= 7) {
          return true;
        }
      }
    }

    if (
      (existingEvent.eventType === "Start" && newEvent.eventType === "Start") ||
      (existingEvent.eventType === "End" && newEvent.eventType === "End")
    ) {
      const dateField =
        existingEvent.eventType === "Start" ? "start_date" : "end_date";
      if (
        existingEvent[dateField] === newEvent[dateField] &&
        existingEvent.agency_name === newEvent.agency_name
      ) {
        return true;
      }
    }

    return false;
  };

  const timeline = records.reduce((acc = {}, record) => {
    const startDate = record.start_date ? new Date(record.start_date) : null;
    const endDate = record.end_date ? new Date(record.end_date) : null;
    const sanctionDate =
      record.sanction_date && !isNaN(Date.parse(record.sanction_date || ""))
        ? new Date(record.sanction_date)
        : record?.case_closed_date
        ? new Date(record?.case_closed_date)
        : null;

    const startYear = startDate?.getFullYear() || null;
    const endYear = endDate?.getFullYear() || null;
    const disciplineYear = sanctionDate?.getFullYear() || null;

    // Add start event
    if (startDate && !(record.offense || record.sanction)) {
      const startDateString = safeFormatDate(startDate);
      const startEvent = createEventObject(record, "Start", startDateString);
      const year = startYear?.toString();

      if (year) {
        if (!acc[year]) acc[year] = [];

        const isDuplicate = acc[year].some(e => areDuplicateEvents(e, startEvent));
        if (!isDuplicate) {
          acc[year].push(startEvent);
        }
      }
    }

    // Add end event
    if (endDate && !(record.offense || record.sanction)) {
      const endDateString = safeFormatDate(endDate);
      const endEvent = createEventObject(record, "End", endDateString);
      const year = endYear?.toString();

      if (year) {
        if (!acc[year]) acc[year] = [];

        const isDuplicate = acc[year].some(e => areDuplicateEvents(e, endEvent));
        if (!isDuplicate) {
          acc[year].push(endEvent);
        }
      }
    }

    // Add discipline event
    if (
      record.state.endsWith("iscipline") &&
      (record.offense || record.sanction)
    ) {
      const dateToUse = sanctionDate;
      const yearToUse = disciplineYear?.toString();

      const dateStringToUse = dateToUse
        ? new Date(
            Date.UTC(
              dateToUse.getUTCFullYear(),
              dateToUse.getUTCMonth(),
              dateToUse.getUTCDate()
            )
          )
            .toISOString()
            .slice(0, 10)
        : "";

      const disciplineEvent = createEventObject(
        record,
        "Discipline",
        dateStringToUse
      );

      if (yearToUse) {
        if (!acc[yearToUse]) acc[yearToUse] = [];

        const isDuplicate = acc[yearToUse].some(e => areDuplicateEvents(e, disciplineEvent));
        if (!isDuplicate) {
          // Check if we need to merge offenses
          const existingIndex = acc[yearToUse].findIndex(e =>
            e.eventType === "Discipline" &&
            e.agency_name === disciplineEvent.agency_name &&
            e.sanction_date === disciplineEvent.sanction_date
          );

          if (existingIndex !== -1 && disciplineEvent.offense) {
            const existing = acc[yearToUse][existingIndex];
            if (existing.offense && !existing.offense.includes(disciplineEvent.offense)) {
              acc[yearToUse][existingIndex] = {
                ...existing,
                offense: `${existing.offense}, ${disciplineEvent.offense}`
              };
            }
          } else {
            acc[yearToUse].push(disciplineEvent);
          }
        }
      }
    }

    return acc;
  }, {} as { [key: string]: PoliceOfficerWithEventType[] });

  return timeline;
}
