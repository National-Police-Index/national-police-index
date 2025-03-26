export interface USState {
  name: string;
  abbreviation: string;
  reference: string;
  hasData: boolean;
  key: string;
  count?: number;
}

//    "florida-discipline"
//    "georgia-discipline"

export const US_STATES: USState[] = [
  { name: 'Alabama', reference: 'Alabama', abbreviation: 'AL', hasData: false, key: 'a76' },
  { name: 'Alaska', reference: 'alaska', abbreviation: 'AK', hasData: false, key: 'a94' },
  { name: 'Arizona', reference: 'arizona', abbreviation: 'AZ', hasData: true, key: 'a54' },
  { name: 'Arkansas', reference: 'arkansas', abbreviation: 'AR', hasData: false, key: 'a60' },
  { name: 'California', reference: 'california', abbreviation: 'CA', hasData: true, key: 'a34' },
  { name: 'Colorado', reference: 'colorado', abbreviation: 'CO', hasData: false, key: 'a38' },
  { name: 'Connecticut', reference: 'connecticut', abbreviation: 'CT', hasData: false, key: 'a32' },
  { name: 'Delaware', reference: 'delaware', abbreviation: 'DE', hasData: false, key: 'a52' },
  { name: 'Columbia', reference: 'columbia', abbreviation: 'DC', hasData: true, key: 'a68' },
  { name: 'Florida', reference: 'florida', abbreviation: 'FL', hasData: true, key: 'a100' },
  { name: 'Georgia', reference: 'georgia', abbreviation: 'GA', hasData: false, key: 'a78' },
  { name: 'Hawaii', reference: 'hawaii', abbreviation: 'HI', hasData: false, key: 'a96' },
  { name: 'Idaho', reference: 'idaho', abbreviation: 'ID', hasData: false, key: 'a2' },
  { name: 'Illinois', reference: 'illinois', abbreviation: 'IL', hasData: true, key: 'a10' },
  { name: 'Indiana', reference: 'indiana', abbreviation: 'IN', hasData: false, key: 'a24' },
  { name: 'Iowa', reference: 'iowa', abbreviation: 'IA', hasData: false, key: 'a22' },
  { name: 'Kansas', reference: 'kansas', abbreviation: 'KS', hasData: false, key: 'a58' },
  { name: 'Kentucky', reference: 'kentucky', abbreviation: 'KY', hasData: false, key: 'a44' },
  { name: 'Louisiana', reference: 'louisiana', abbreviation: 'LA', hasData: false, key: 'a72' },
  { name: 'Maine', reference: 'maine', abbreviation: 'ME', hasData: false, key: 'a90' },
  { name: 'Maryland', reference: 'maryland', abbreviation: 'MD', hasData: false, key: 'a50' },
  { name: 'Massachusetts', reference: 'massachusetts', abbreviation: 'MA', hasData: false, key: 'a82' },
  { name: 'Michigan', reference: 'michigan', abbreviation: 'MI', hasData: false, key: 'a12' },
  { name: 'Minnesota', reference: 'minnesota', abbreviation: 'MN', hasData: true, key: 'a8' },
  { name: 'Mississippi', reference: 'mississippi', abbreviation: 'MS', hasData: false, key: 'a74' },
  { name: 'Missouri', reference: 'missouri', abbreviation: 'MO', hasData: false, key: 'a42' },
  { name: 'Montana', reference: 'montana', abbreviation: 'MT', hasData: false, key: 'a4' },
  { name: 'Nebraska', reference: 'nebraska', abbreviation: 'NE', hasData: false, key: 'a40' },
  { name: 'Nevada', reference: 'nevada', abbreviation: 'NV', hasData: false, key: 'a36' },
  { name: 'New Hampshire', reference: 'new-hampshire', abbreviation: 'NH', hasData: false, key: 'a88' },
  { name: 'New Jersey', reference: 'new-jersey', abbreviation: 'NJ', hasData: false, key: 'a30' },
  { name: 'New Mexico', reference: 'new-mexico', abbreviation: 'NM', hasData: false, key: 'a56' },
  { name: 'New York', reference: 'new-york', abbreviation: 'NY', hasData: true, key: 'a80' },
  { name: 'North Carolina', reference: 'north-carolina', abbreviation: 'NC', hasData: false, key: 'a64' },
  { name: 'North Dakota', reference: 'north-dakota', abbreviation: 'ND', hasData: false, key: 'a6' },
  { name: 'Ohio', reference: 'ohio', abbreviation: 'OH', hasData: false, key: 'a26' },
  { name: 'Oklahoma', reference: 'oklahoma', abbreviation: 'OK', hasData: false, key: 'a70' },
  { name: 'Oregon', reference: 'oregon', abbreviation: 'OR', hasData: false, key: 'a14' },
  { name: 'Pennsylvania', reference: 'pennsylvania', abbreviation: 'PA', hasData: false, key: 'a28' },
  { name: 'Rhode Island', reference: 'rhode-island', abbreviation: 'RI', hasData: false, key: 'a84' },
  { name: 'South Carolina', reference: 'south-carolina', abbreviation: 'SC', hasData: false, key: 'a66' },
  { name: 'South Dakota', reference: 'south-dakota', abbreviation: 'SD', hasData: false, key: 'a20' },
  { name: 'Tennessee', reference: 'tennessee', abbreviation: 'TN', hasData: false, key: 'a62' },
  { name: 'Texas', reference: 'texas', abbreviation: 'TX', hasData: true, key: 'a98' },
  { name: 'Utah', reference: 'utah', abbreviation: 'UT', hasData: false, key: 'a16' },
  { name: 'Vermont', reference: 'vermont', abbreviation: 'VT', hasData: false, key: 'a86' },
  { name: 'Virginia', reference: 'virginia', abbreviation: 'VA', hasData: false, key: 'a48' },
  { name: 'Washington', reference: 'washington', abbreviation: 'WA', hasData: false, key: 'a0' },
  { name: 'West Virginia', reference: 'west-virginia', abbreviation: 'WV', hasData: false, key: 'a46' },
  { name: 'Wisconsin', reference: 'wisconsin', abbreviation: 'WI', hasData: false, key: 'a92' },
  { name: 'Wyoming', reference: 'wyoming', abbreviation: 'WY', hasData: false, key: 'a18' },
];
