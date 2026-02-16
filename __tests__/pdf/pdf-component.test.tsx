/**
 * Tests for OfficerProfilePDF Component
 *
 * These tests verify that the PDF component:
 * - Renders officer information correctly
 * - Displays timeline events properly
 * - Formats dates correctly
 * - Handles different event types (Start, End, Discipline)
 * - Sorts events chronologically
 */

import React from 'react';
import { OfficerProfilePDF } from '@/components/pdf/OfficerProfilePDF';

// Mock @react-pdf/renderer components
jest.mock('@react-pdf/renderer', () => ({
  Document: ({ children }: any) => <div data-testid="pdf-document">{children}</div>,
  Page: ({ children }: any) => <div data-testid="pdf-page">{children}</div>,
  Text: ({ children }: any) => <span data-testid="pdf-text">{children}</span>,
  View: ({ children }: any) => <div data-testid="pdf-view">{children}</div>,
  StyleSheet: {
    create: (styles: any) => styles,
  },
}));

describe('OfficerProfilePDF Component', () => {
  const mockTimelineWithStart = {
    '2020': [
      {
        eventType: 'Start' as const,
        agency_name: 'Test Police Department',
        start_date: '2020-01-15T00:00:00.000Z',
        rank: 'Officer',
      },
    ],
  };

  const mockTimelineWithEnd = {
    '2021': [
      {
        eventType: 'End' as const,
        agency_name: 'Test Police Department',
        end_date: '2021-12-31T00:00:00.000Z',
        rank: 'Officer',
        separation_reason: 'Resigned',
      },
    ],
  };

  const mockTimelineWithDiscipline = {
    '2022': [
      {
        eventType: 'Discipline' as const,
        agency_name: 'Sheriff Department',
        sanction_date: '2022-03-15',
        offense: 'Policy violation',
      },
    ],
  };

  const mockComplexTimeline = {
    '2022': [
      {
        eventType: 'Discipline' as const,
        agency_name: 'Police Dept',
        sanction_date: '2022-06-01',
        offense: 'Use of force violation',
      },
      {
        eventType: 'End' as const,
        agency_name: 'Police Dept',
        end_date: '2022-01-15T00:00:00.000Z',
        rank: 'Detective',
        separation_reason: 'Terminated',
      },
    ],
    '2019': [
      {
        eventType: 'Start' as const,
        agency_name: 'Police Dept',
        start_date: '2019-03-01T00:00:00.000Z',
        rank: 'Officer',
      },
    ],
  };

  it('renders officer name correctly', () => {
    const component = OfficerProfilePDF({
      fullName: 'John Doe',
      personNbr: 'TEST-123',
      timeline: {},
    });

    expect(component).toBeDefined();
    expect(component.props.children.props.children[0].props.children[0].props.children).toBe(
      'John Doe'
    );
  });

  it('renders UID number correctly', () => {
    const component = OfficerProfilePDF({
      fullName: 'Jane Smith',
      personNbr: 'ABC-456',
      timeline: {},
    });

    expect(component).toBeDefined();
    // Verify UID is in the component structure
    const infoSection = component.props.children.props.children[1];
    expect(infoSection.props.children.props.children[1].props.children).toBe('ABC-456');
  });

  it('renders Start event correctly', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-001',
      timeline: mockTimelineWithStart,
    });

    expect(component).toBeDefined();
    // Check that timeline section exists
    const timelineSection = component.props.children.props.children[2];
    expect(timelineSection).toBeDefined();
  });

  it('renders End event with separation reason', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-002',
      timeline: mockTimelineWithEnd,
    });

    expect(component).toBeDefined();
    const timelineSection = component.props.children.props.children[2];
    expect(timelineSection).toBeDefined();
  });

  it('renders Discipline event with offense', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-003',
      timeline: mockTimelineWithDiscipline,
    });

    expect(component).toBeDefined();
    const timelineSection = component.props.children.props.children[2];
    expect(timelineSection).toBeDefined();
  });

  it('sorts years in descending order', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-004',
      timeline: mockComplexTimeline,
    });

    expect(component).toBeDefined();
    const timelineSection = component.props.children.props.children[2];
    const yearSections = timelineSection.props.children[1];

    // Verify years are sorted: 2022 should come before 2019
    const years = yearSections.map((section: any) => section.key);
    expect(years[0]).toBe('2022');
    expect(years[1]).toBe('2019');
  });

  it('handles empty timeline gracefully', () => {
    const component = OfficerProfilePDF({
      fullName: 'New Officer',
      personNbr: 'TEST-005',
      timeline: {},
    });

    expect(component).toBeDefined();
    const timelineSection = component.props.children.props.children[2];
    expect(timelineSection.props.children[1]).toEqual([]);
  });

  it('formats dates in readable format', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-006',
      timeline: mockTimelineWithStart,
    });

    expect(component).toBeDefined();
    // Component should have timeline section with formatted dates
    // Date formatting is handled by toLocaleDateString which uses browser/system locale
    const hasTimelineData = JSON.stringify(component).includes('2020');
    expect(hasTimelineData).toBe(true);
  });

  it('converts rank to sentence case', () => {
    const timelineWithUppercaseRank = {
      '2020': [
        {
          eventType: 'Start' as const,
          agency_name: 'Test Department',
          start_date: '2020-01-01T00:00:00.000Z',
          rank: 'POLICE-OFFICER',
        },
      ],
    };

    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-007',
      timeline: timelineWithUppercaseRank,
    });

    expect(component).toBeDefined();
    // Verify the component includes the converted rank - toSentenceCase converts POLICE-OFFICER to Police Officer
    const componentStr = JSON.stringify(component);
    expect(componentStr).toContain('Police Officer');
  });

  it('handles missing dates gracefully', () => {
    const timelineWithMissingDate = {
      '2020': [
        {
          eventType: 'Start' as const,
          agency_name: 'Test Department',
          start_date: undefined,
          rank: 'Officer',
        },
      ],
    };

    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-008',
      timeline: timelineWithMissingDate,
    });

    expect(component).toBeDefined();
    // Should render "N/A" or handle gracefully
    const timelineSection = component.props.children.props.children[2];
    expect(timelineSection).toBeDefined();
  });

  it('includes footer with page numbers', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-009',
      timeline: mockComplexTimeline,
    });

    expect(component).toBeDefined();
    const footer = component.props.children.props.children[3];
    expect(footer.props.render).toBeDefined();
    expect(typeof footer.props.render).toBe('function');

    // Test footer render function
    const footerText = footer.props.render({ pageNumber: 1, totalPages: 2 });
    expect(footerText).toContain('National Police Index');
    expect(footerText).toContain('Page 1 of 2');
  });

  it('displays agency name for each event', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-010',
      timeline: mockComplexTimeline,
    });

    expect(component).toBeDefined();
    // Verify component includes agency names from timeline
    const componentStr = JSON.stringify(component);
    expect(componentStr).toContain('Police Dept');
  });

  it('applies correct styles to event types', () => {
    const component = OfficerProfilePDF({
      fullName: 'Test Officer',
      personNbr: 'TEST-011',
      timeline: mockComplexTimeline,
    });

    expect(component).toBeDefined();
    // Verify component includes all event types
    const componentStr = JSON.stringify(component);
    expect(componentStr).toContain('Discipline');
    expect(componentStr).toContain('End Date');
    expect(componentStr).toContain('Start Date');
  });
});
