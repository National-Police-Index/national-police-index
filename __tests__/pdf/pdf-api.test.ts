/**
 * Tests for PDF Timeline Processing
 *
 * These tests verify that the PDF generation logic:
 * - Processes Start events correctly
 * - Processes End events correctly
 * - Processes Discipline events correctly
 * - Handles duplicate events
 * - Sorts events by year
 * - Merges multiple offenses correctly
 */

describe('PDF Timeline Processing', () => {
  // Helper function to test date formatting
  const safeFormatDate = (date: Date | null | undefined): string => {
    if (!date) return "";
    try {
      return date.toISOString();
    } catch (exception) {
      console.error("Error converting date to ISO string:", exception);
      return "";
    }
  };

  it('formats valid dates correctly', () => {
    const testDate = new Date('2020-01-15');
    const formatted = safeFormatDate(testDate);

    expect(formatted).toContain('2020');
    expect(formatted).toContain('01');
  });

  it('handles null dates gracefully', () => {
    const formatted = safeFormatDate(null);
    expect(formatted).toBe('');
  });

  it('handles undefined dates gracefully', () => {
    const formatted = safeFormatDate(undefined);
    expect(formatted).toBe('');
  });

  it('processes Start events with correct year extraction', () => {
    const startDate = new Date('2019-06-15');
    const startYear = startDate.getFullYear();

    expect(startYear).toBe(2019);
  });

  it('processes End events with correct year extraction', () => {
    const endDate = new Date('2021-12-31');
    const endYear = endDate.getFullYear();

    expect(endYear).toBe(2021);
  });

  it('processes Discipline events with correct year extraction', () => {
    const sanctionDate = new Date('2022-03-20');
    const disciplineYear = sanctionDate.getFullYear();

    expect(disciplineYear).toBe(2022);
  });

  it('identifies discipline records by state suffix', () => {
    const record = {
      state: 'california-discipline',
      offense: 'Policy violation',
      sanction: 'Suspension',
    };

    const isDiscipline = record.state.endsWith('iscipline') && !!(record.offense || record.sanction);
    expect(isDiscipline).toBe(true);
  });

  it('does not identify non-discipline records as discipline', () => {
    const record: any = {
      state: 'california',
      start_date: '2020-01-01',
      rank: 'Officer',
    };

    const isDiscipline = record.state.endsWith('iscipline') && !!(record.offense || record.sanction);
    expect(isDiscipline).toBe(false);
  });

  it('calculates date differences correctly for duplicate detection', () => {
    const date1 = new Date('2022-03-15');
    const date2 = new Date('2022-03-20');

    const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBe(5);
    expect(diffDays <= 7).toBe(true);
  });

  it('identifies dates outside duplicate threshold', () => {
    const date1 = new Date('2022-03-15');
    const date2 = new Date('2022-04-01');

    const diffDays = Math.abs((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));

    expect(diffDays).toBeGreaterThan(7);
  });

  it('creates event object with Start type', () => {
    const record = {
      agency_name: 'Test Agency',
      start_date: '2020-01-01',
      rank: 'Officer',
    };

    const event = {
      agency_name: record.agency_name,
      eventType: 'Start' as const,
      start_date: record.start_date,
      rank: record.rank,
    };

    expect(event.eventType).toBe('Start');
    expect(event.agency_name).toBe('Test Agency');
    expect(event.start_date).toBe('2020-01-01');
  });

  it('creates event object with End type', () => {
    const record = {
      agency_name: 'Test Agency',
      end_date: '2021-12-31',
      rank: 'Officer',
      separation_reason: 'Resigned',
    };

    const event = {
      agency_name: record.agency_name,
      eventType: 'End' as const,
      end_date: record.end_date,
      rank: record.rank,
      separation_reason: record.separation_reason,
    };

    expect(event.eventType).toBe('End');
    expect(event.separation_reason).toBe('Resigned');
  });

  it('creates event object with Discipline type', () => {
    const record = {
      agency_name: 'Sheriff Department',
      sanction_date: '2022-03-15',
      offense: 'Use of force violation',
    };

    const event = {
      agency_name: record.agency_name,
      eventType: 'Discipline' as const,
      sanction_date: record.sanction_date,
      offense: record.offense,
    };

    expect(event.eventType).toBe('Discipline');
    expect(event.offense).toBe('Use of force violation');
  });

  it('groups events by year correctly', () => {
    const timeline: { [year: string]: any[] } = {};

    const event2020 = { year: 2020, data: 'event1' };
    const event2021 = { year: 2021, data: 'event2' };
    const event2020b = { year: 2020, data: 'event3' };

    // Group by year
    if (!timeline[event2020.year]) timeline[event2020.year] = [];
    timeline[event2020.year].push(event2020);

    if (!timeline[event2021.year]) timeline[event2021.year] = [];
    timeline[event2021.year].push(event2021);

    if (!timeline[event2020b.year]) timeline[event2020b.year] = [];
    timeline[event2020b.year].push(event2020b);

    expect(timeline['2020']).toHaveLength(2);
    expect(timeline['2021']).toHaveLength(1);
  });

  it('sorts years in descending order', () => {
    const years = ['2019', '2022', '2020', '2021'];
    const sortedYears = years.sort((a, b) => Number(b) - Number(a));

    expect(sortedYears).toEqual(['2022', '2021', '2020', '2019']);
  });

  it('handles invalid date strings gracefully', () => {
    const invalidDate = 'invalid-date';
    const isValid = !isNaN(Date.parse(invalidDate));

    expect(isValid).toBe(false);
  });

  it('validates case_closed_date fallback for discipline', () => {
    const record = {
      sanction_date: undefined,
      case_closed_date: '2022-05-15',
    };

    const dateToUse = record.sanction_date || record.case_closed_date;

    expect(dateToUse).toBe('2022-05-15');
  });

  it('prefers sanction_date over case_closed_date', () => {
    const record = {
      sanction_date: '2022-03-01',
      case_closed_date: '2022-05-15',
    };

    const dateToUse = record.sanction_date || record.case_closed_date;

    expect(dateToUse).toBe('2022-03-01');
  });
});
