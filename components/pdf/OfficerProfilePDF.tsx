import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

interface TimelineEvent {
  eventType: 'Start' | 'End' | 'Discipline';
  agency_name: string;
  start_date?: string;
  end_date?: string;
  sanction_date?: string;
  rank?: string;
  offense?: string;
  sanction?: string;
  separation_reason?: string;
  violation?: string;
}

interface OfficerProfilePDFProps {
  fullName: string;
  personNbr: string;
  timeline: { [year: string]: TimelineEvent[] };
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottom: '2pt solid #2F5E50',
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#122823',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  infoSection: {
    marginBottom: 30,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#122823',
  },
  infoValue: {
    flex: 1,
    color: '#333',
  },
  timelineSection: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#122823',
    marginBottom: 15,
    borderBottom: '1pt solid #2F5E50',
    paddingBottom: 5,
  },
  yearSection: {
    marginBottom: 20,
  },
  yearTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#122823',
    marginBottom: 10,
  },
  eventItem: {
    marginBottom: 12,
    paddingLeft: 15,
    borderLeft: '3pt solid #E5E7EB',
  },
  eventRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  eventDate: {
    width: 80,
    fontSize: 10,
    color: '#666',
  },
  eventContent: {
    flex: 1,
  },
  eventAgency: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#122823',
    marginBottom: 2,
  },
  eventDetails: {
    fontSize: 10,
    color: '#555',
    marginTop: 2,
  },
  eventType: {
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    marginTop: 3,
    alignSelf: 'flex-start',
  },
  eventTypeStart: {
    backgroundColor: '#D1FAE5',
    color: '#065F46',
  },
  eventTypeEnd: {
    backgroundColor: '#FEE2E2',
    color: '#991B1B',
  },
  eventTypeDiscipline: {
    backgroundColor: '#FEF3C7',
    color: '#92400E',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 9,
    color: '#999',
    borderTop: '1pt solid #E5E7EB',
    paddingTop: 10,
  },
});

const toSentenceCase = (str: string) => {
  if (!str) return '';
  return str
    .replace(/-+/g, " ")
    .replace(
      /\w\S*/g,
      (text: string) =>
        text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
    );
};

export const OfficerProfilePDF: React.FC<OfficerProfilePDFProps> = ({
  fullName,
  personNbr,
  timeline,
}) => {
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        timeZone: 'UTC',
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const sortedYears = Object.keys(timeline).sort((a, b) => Number(b) - Number(a));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{fullName}</Text>
          <Text style={styles.subtitle}>Officer Profile</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>UID Number:</Text>
            <Text style={styles.infoValue}>{personNbr}</Text>
          </View>
        </View>

        <View style={styles.timelineSection}>
          <Text style={styles.sectionTitle}>Timeline</Text>

          {sortedYears.map((year) => {
            const events = timeline[year];
            const sortedEvents = events.sort((a, b) => {
              const dateA =
                a.eventType === 'Discipline' || a.eventType === 'Start'
                  ? new Date(a.start_date || a.sanction_date || '')
                  : new Date(a.end_date || '');
              const dateB =
                b.eventType === 'Discipline' || b.eventType === 'Start'
                  ? new Date(b.start_date || b.sanction_date || '')
                  : new Date(b.end_date || '');
              return dateB.getTime() - dateA.getTime();
            });

            return (
              <View key={year} style={styles.yearSection} wrap={false}>
                <Text style={styles.yearTitle}>{year}</Text>

                {sortedEvents.map((event, index) => {
                  const eventDate =
                    event.eventType === 'Start'
                      ? event.start_date
                      : event.eventType === 'End'
                      ? event.end_date
                      : event.sanction_date;

                  const eventTypeStyle =
                    event.eventType === 'Start'
                      ? styles.eventTypeStart
                      : event.eventType === 'End'
                      ? styles.eventTypeEnd
                      : styles.eventTypeDiscipline;

                  return (
                    <View key={`${year}-${index}`} style={styles.eventItem}>
                      <View style={styles.eventRow}>
                        <Text style={styles.eventDate}>{formatDate(eventDate)}</Text>
                        <View style={styles.eventContent}>
                          <Text style={styles.eventAgency}>{event.agency_name}</Text>

                          {event.eventType === 'Discipline' && (
                            <Text style={styles.eventDetails}>
                              {event.offense || event.violation || event.sanction || 'Disciplinary action'}
                            </Text>
                          )}

                          {event.eventType === 'Start' && event.rank && (
                            <Text style={styles.eventDetails}>
                              {toSentenceCase(event.rank)}
                            </Text>
                          )}

                          {event.eventType === 'End' && (
                            <Text style={styles.eventDetails}>
                              {event.rank ? toSentenceCase(event.rank) : ''}
                              {event.rank && event.separation_reason ? ', ' : ''}
                              {event.separation_reason || ''}
                            </Text>
                          )}

                          <View style={[styles.eventType, eventTypeStyle]}>
                            <Text>
                              {event.eventType === 'Start'
                                ? 'Start Date'
                                : event.eventType === 'End'
                                ? 'End Date'
                                : 'Discipline'}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            );
          })}
        </View>

        <Text
          style={styles.footer}
          render={({ pageNumber, totalPages }) =>
            `Generated from National Police Index | Page ${pageNumber} of ${totalPages}`
          }
          fixed
        />
      </Page>
    </Document>
  );
};
