export interface USState {
  name: string;
  abbreviation: string;
  reference: string;
  hasData: boolean;
  key: string;
  count?: number;
  dataFlag: string;
}

//    "florida-discipline"
//    "georgia-discipline"

export const US_STATES: USState[] = [
  { name: 'Alabama', reference: 'alabama', abbreviation: 'AL', hasData: false, key: 'a38', dataFlag: 'no_data_lb' },
  { name: 'Alaska', reference: 'alaska', abbreviation: 'AK', hasData: true, key: 'a47', dataFlag: 'full' },
  { name: 'Arizona', reference: 'arizona', abbreviation: 'AZ', hasData: true, key: 'a27', dataFlag: 'full' },
  { name: 'Arkansas', reference: 'arkansas', abbreviation: 'AR', hasData: false, key: 'a30', dataFlag: 'no_data_lb' },
  { name: 'California', reference: 'california', abbreviation: 'CA', hasData: true, key: 'a17', dataFlag: 'full' },
  { name: 'Colorado', reference: 'colorado', abbreviation: 'CO', hasData: false, key: 'a19', dataFlag: 'no_data_lb' },
  { name: 'Connecticut', reference: 'connecticut', abbreviation: 'CT', hasData: false, key: 'a16', dataFlag: 'no_data_tb' },
  { name: 'Delaware', reference: 'delaware', abbreviation: 'DE', hasData: true, key: 'a26', dataFlag: 'full' },
  { name: 'Columbia', reference: 'columbia', abbreviation: 'DC', hasData: true, key: 'a34', dataFlag: 'full' },
  { name: 'Florida', reference: 'florida', abbreviation: 'FL', hasData: true, key: 'a50', dataFlag: 'full' },
  { name: 'Georgia', reference: 'georgia', abbreviation: 'GA', hasData: true, key: 'a39', dataFlag: 'full' },
  { name: 'Hawaii', reference: 'hawaii', abbreviation: 'HI', hasData: true, key: 'a48', dataFlag: 'full' },
  { name: 'Idaho', reference: 'idaho', abbreviation: 'ID', hasData: true, key: 'a1', dataFlag: 'comming_soon' },
  { name: 'Illinois', reference: 'illinois', abbreviation: 'IL', hasData: true, key: 'a5', dataFlag: 'full' },
  { name: 'Indiana', reference: 'indiana', abbreviation: 'IN', hasData: true, key: 'a12', dataFlag: 'full' },
  { name: 'Iowa', reference: 'iowa', abbreviation: 'IA', hasData: true, key: 'a11', dataFlag: 'comming_soon' },
  { name: 'Kansas', reference: 'kansas', abbreviation: 'KS', hasData: true, key: 'a29', dataFlag: 'full' },
  { name: 'Kentucky', reference: 'kentucky', abbreviation: 'KY', hasData: true, key: 'a22', dataFlag: 'full' },
  { name: 'Louisiana', reference: 'louisiana', abbreviation: 'LA', hasData: true, key: 'a36', dataFlag: 'some_data' },
  { name: 'Maine', reference: 'maine', abbreviation: 'ME', hasData: false, key: 'a45', dataFlag: 'no_data_tb' },
  { name: 'Maryland', reference: 'maryland', abbreviation: 'MD', hasData: true, key: 'a25', dataFlag: 'full' },
  { name: 'Massachusetts', reference: 'massachusetts', abbreviation: 'MA', hasData: false, key: 'a41', dataFlag: 'no_data_tb' },
  { name: 'Michigan', reference: 'michigan', abbreviation: 'MI', hasData: false, key: 'a6', dataFlag: 'no_data_lb' },
  { name: 'Minnesota', reference: 'minnesota', abbreviation: 'MN', hasData: true, key: 'a4', dataFlag: 'full' },
  { name: 'Mississippi', reference: 'mississippi', abbreviation: 'MS', hasData: true, key: 'a37', dataFlag: 'full' },
  { name: 'Missouri', reference: 'missouri', abbreviation: 'MO', hasData: false, key: 'a21', dataFlag: 'no_data_lb' },
  { name: 'Montana', reference: 'montana', abbreviation: 'MT', hasData: false, key: 'a2', dataFlag: 'no_data_lb' },
  { name: 'Nebraska', reference: 'nebraska', abbreviation: 'NE', hasData: false, key: 'a20', dataFlag: 'no_data_tb' },
  { name: 'Nevada', reference: 'nevada', abbreviation: 'NV', hasData: false, key: 'a18', dataFlag: 'no_data_lb' },
  { name: 'New Hampshire', reference: 'new-hampshire', abbreviation: 'NH', hasData: false, key: 'a44', dataFlag: 'no_data_tb' },
  { name: 'New Jersey', reference: 'new-jersey', abbreviation: 'NJ', hasData: false, key: 'a15', dataFlag: 'no_data_tb' },
  { name: 'New Mexico', reference: 'new-mexico', abbreviation: 'NM', hasData: true, key: 'a28', dataFlag: 'full' },
  { name: 'New York', reference: 'new-york', abbreviation: 'NY', hasData: false, key: 'a40', dataFlag: 'no_data_lb' },
  { name: 'North Carolina', reference: 'north-carolina', abbreviation: 'NC', hasData: true, key: 'a32', dataFlag: 'full' },
  { name: 'North Dakota', reference: 'north-dakota', abbreviation: 'ND', hasData: true, key: 'a3', dataFlag: 'comming_soon' },
  { name: 'Ohio', reference: 'ohio', abbreviation: 'OH', hasData: true, key: 'a13', dataFlag: 'full' },
  { name: 'Oklahoma', reference: 'oklahoma', abbreviation: 'OK', hasData: false, key: 'a35', dataFlag: 'no_data_lb' },
  { name: 'Oregon', reference: 'oregon', abbreviation: 'OR', hasData: true, key: 'a7', dataFlag: 'full' },
  { name: 'Pennsylvania', reference: 'pennsylvania', abbreviation: 'PA', hasData: false, key: 'a14', dataFlag: 'no_data_lb' },
  { name: 'Rhode Island', reference: 'rhode-island', abbreviation: 'RI', hasData: true, key: 'a42', dataFlag: 'full' },
  { name: 'South Carolina', reference: 'south-carolina', abbreviation: 'SC', hasData: true, key: 'a33', dataFlag: 'full' },
  { name: 'South Dakota', reference: 'south-dakota', abbreviation: 'SD', hasData: false, key: 'a10', dataFlag: 'no_data_lb' },
  { name: 'Tennessee', reference: 'tennessee', abbreviation: 'TN', hasData: true, key: 'a31', dataFlag: 'full' },
  { name: 'Texas', reference: 'texas', abbreviation: 'TX', hasData: true, key: 'a49', dataFlag: 'full' },
  { name: 'Utah', reference: 'utah', abbreviation: 'UT', hasData: true, key: 'a8', dataFlag: 'full' },
  { name: 'Vermont', reference: 'vermont', abbreviation: 'VT', hasData: true, key: 'a43', dataFlag: 'full' },
  { name: 'Virginia', reference: 'virginia', abbreviation: 'VA', hasData: false, key: 'a24', dataFlag: 'no_data_lb' },
  { name: 'Washington', reference: 'washington', abbreviation: 'WA', hasData: true, key: 'a0', dataFlag: 'full' },
  { name: 'West Virginia', reference: 'west-virginia', abbreviation: 'WV', hasData: true, key: 'a23', dataFlag: 'full' },
  { name: 'Wisconsin', reference: 'wisconsin', abbreviation: 'WI', hasData: false, key: 'a46', dataFlag: 'no_data_lb' },
  { name: 'Wyoming', reference: 'wyoming', abbreviation: 'WY', hasData: true, key: 'a9', dataFlag: 'full' },
];
