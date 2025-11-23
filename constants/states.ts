export interface USState {
  name: string;
  abbreviation: string;
  reference: string;
  hasData: boolean;
  key: string;
  count?: number;
  dataFlag: string;
  url?: string;
}

//    "florida-discipline"
//    "georgia-discipline"

export const US_STATES: USState[] = [
  {
    name: "Alabama",
    reference: "alabama",
    abbreviation: "AL",
    hasData: false,
    key: "a38",
    dataFlag: "no_data_lb",
    url: "https://www.al.com/news/2024/09/police-employment-history-is-usually-a-public-record-in-alabama-its-a-state-secret.html",
  },
  {
    name: "Alaska",
    reference: "alaska",
    abbreviation: "AK",
    hasData: false,
    key: "a47",
    dataFlag: "coming_soon",
  },
  {
    name: "Arizona",
    reference: "arizona",
    abbreviation: "AZ",
    hasData: true,
    key: "a27",
    dataFlag: "full",
  },
  {
    name: "Arkansas",
    reference: "arkansas",
    abbreviation: "AR",
    hasData: false,
    key: "a30",
    dataFlag: "no_data_lb",
    url: "https://arkansasadvocate.com/2023/11/27/arkansas-declines-to-release-police-officer-database-preventing-public-oversight-of-problem-cops/",
  },
  {
    name: "California",
    reference: "california",
    abbreviation: "CA",
    hasData: true,
    key: "a17",
    dataFlag: "full",
  },
  {
    name: "Colorado",
    reference: "colorado",
    abbreviation: "CO",
    hasData: false,
    key: "a19",
    dataFlag: "no_data_lb",
    url: "https://coloradofoic.org/even-with-new-post-database-and-reforms-colorado-is-in-the-minority-of-states-keeping-comprehensive-police-officer-data-secret/",
  },
  {
    name: "Connecticut",
    reference: "connecticut",
    abbreviation: "CT",
    hasData: false,
    key: "a16",
    dataFlag: "no_data_tb",
  },
  {
    name: "Delaware",
    reference: "delaware",
    abbreviation: "DE",
    hasData: false,
    key: "a26",
    dataFlag: "no_data_lb",
    url: "https://delawarecall.com/2024/03/14/delaware-opened-up-access-to-some-police-misconduct-records-but-still-denies-requests-for-basic-police-data/",
  },
  {
    name: "District of Columbia",
    reference: "columbia",
    abbreviation: "DC",
    hasData: false,
    key: "a34",
    dataFlag: "coming_soon",
  },
  {
    name: "Florida",
    reference: "florida",
    abbreviation: "FL",
    hasData: true,
    key: "a50",
    dataFlag: "full",
  },
  {
    name: "Florida - Discipline",
    reference: "florida-discipline",
    abbreviation: "FLD",
    hasData: true,
    key: "a50d",
    dataFlag: "full",
  },
  {
    name: "Georgia",
    reference: "georgia",
    abbreviation: "GA",
    hasData: true,
    key: "a39",
    dataFlag: "full",
  },
  {
    name: "Georgia - Discipline",
    reference: "georgia-discipline",
    abbreviation: "GAD",
    hasData: true,
    key: "a39d",
    dataFlag: "full",
  },
  {
    name: "Hawaii",
    reference: "hawaii",
    abbreviation: "HI",
    hasData: false,
    key: "a48",
    dataFlag: "coming_soon",
  },
  {
    name: "Idaho",
    reference: "idaho",
    abbreviation: "ID",
    hasData: true,
    key: "a1",
    dataFlag: "full",
  },
  {
    name: "Illinois",
    reference: "illinois",
    abbreviation: "IL",
    hasData: true,
    key: "a5",
    dataFlag: "full",
  },
  {
    name: "Indiana",
    reference: "indiana",
    abbreviation: "IN",
    hasData: true,
    key: "a12",
    dataFlag: "full",
  },
  {
    name: "Iowa",
    reference: "iowa",
    abbreviation: "IA",
    hasData: false,
    key: "a11",
    dataFlag: "coming_soon",
  },
  {
    name: "Kansas",
    reference: "kansas",
    abbreviation: "KS",
    hasData: true,
    key: "a29",
    dataFlag: "full",
  },
  {
    name: "Kentucky",
    reference: "kentucky",
    abbreviation: "KY",
    hasData: true,
    key: "a22",
    dataFlag: "full",
  },
  {
    name: "Louisiana",
    reference: "louisiana",
    abbreviation: "LA",
    hasData: false,
    key: "a36",
    dataFlag: "some_data",
    url: "https://llead.co/",
  },
  {
    name: "Maine",
    reference: "maine",
    abbreviation: "ME",
    hasData: false,
    key: "a45",
    dataFlag: "no_data_tb",
  },
  {
    name: "Maryland",
    reference: "maryland",
    abbreviation: "MD",
    hasData: true,
    key: "a25",
    dataFlag: "full",
  },
  {
    name: "Massachusetts",
    reference: "massachusetts",
    abbreviation: "MA",
    hasData: false,
    key: "a41",
    dataFlag: "no_data_tb",
  },
  {
    name: "Michigan",
    reference: "michigan",
    abbreviation: "MI",
    hasData: false,
    key: "a6",
    dataFlag: "no_data_lb",
    url: "https://www.metrotimes.com/news/police-transparency-expands-with-new-national-database-but-michigan-blocks-officer-data-37384703",
  },
  {
    name: "Minnesota",
    reference: "minnesota",
    abbreviation: "MN",
    hasData: true,
    key: "a4",
    dataFlag: "full",
  },
  {
    name: "Mississippi",
    reference: "mississippi",
    abbreviation: "MS",
    hasData: true,
    key: "a37",
    dataFlag: "full",
  },
  {
    name: "Missouri",
    reference: "missouri",
    abbreviation: "MO",
    hasData: false,
    key: "a21",
    dataFlag: "no_data_lb",
    url: "https://gatewayjr.org/missouri-is-home-of-police-decertification-it-also-keeps-data-showing-wandering-officers-a-secret/",
  },
  {
    name: "Montana",
    reference: "montana",
    abbreviation: "MT",
    hasData: false,
    key: "a2",
    dataFlag: "no_data_lb",
    url: "https://thepulp.org/montana-blocks-access-to-basic-police-data/",
  },
  {
    name: "Nebraska",
    reference: "nebraska",
    abbreviation: "NE",
    hasData: false,
    key: "a20",
    dataFlag: "no_data_tb",
  },
  {
    name: "Nevada",
    reference: "nevada",
    abbreviation: "NV",
    hasData: false,
    key: "a18",
    dataFlag: "no_data_lb",
    url: "https://www.reviewjournal.com/investigations/agency-withholds-data-about-police-certification-employment-history-from-journalists-2881670/",
  },
  {
    name: "New Hampshire",
    reference: "new-hampshire",
    abbreviation: "NH",
    hasData: false,
    key: "a44",
    dataFlag: "no_data_tb",
    url: "https://newhampshirebulletin.com/2024/09/20/nh-was-tasked-with-tracking-police-employment-history-citing-cost-police-regulators-cut-it-off/",
  },
  {
    name: "New Jersey",
    reference: "new-jersey",
    abbreviation: "NJ",
    hasData: false,
    key: "a15",
    dataFlag: "no_data_tb",
  },
  {
    name: "New Mexico",
    reference: "new-mexico",
    abbreviation: "NM",
    hasData: true,
    key: "a28",
    dataFlag: "full",
  },
  {
    name: "New York",
    reference: "new-york",
    abbreviation: "NY",
    hasData: false,
    key: "a40",
    dataFlag: "no_data_lb",
    url: "https://nysfocus.com/2024/10/31/new-york-police-misconduct-employment-records",
  },
  {
    name: "North Carolina",
    reference: "north-carolina",
    abbreviation: "NC",
    hasData: true,
    key: "a32",
    dataFlag: "full",
  },
  {
    name: "North Dakota",
    reference: "north-dakota",
    abbreviation: "ND",
    hasData: false,
    key: "a3",
    dataFlag: "coming_soon",
  },
  {
    name: "Ohio",
    reference: "ohio",
    abbreviation: "OH",
    hasData: true,
    key: "a13",
    dataFlag: "full",
  },
  {
    name: "Oklahoma",
    reference: "oklahoma",
    abbreviation: "OK",
    hasData: false,
    key: "a35",
    dataFlag: "no_data_lb",
  },
  {
    name: "Oregon",
    reference: "oregon",
    abbreviation: "OR",
    hasData: true,
    key: "a7",
    dataFlag: "full",
  },
  {
    name: "Pennsylvania",
    reference: "pennsylvania",
    abbreviation: "PA",
    hasData: false,
    key: "a14",
    dataFlag: "no_data_lb",
    url: "https://www.spotlightpa.org/news/2023/08/pennsylvania-police-officer-data-denied/",
  },
  {
    name: "Puerto Rico",
    reference: "puerto-rico",
    abbreviation: "PR",
    hasData: false,
    key: "a51",
    dataFlag: "coming_soon",
  },
  {
    name: "Rhode Island",
    reference: "rhode-island",
    abbreviation: "RI",
    hasData: false,
    key: "a42",
    dataFlag: "no_data_tb",
  },
  {
    name: "South Carolina",
    reference: "south-carolina",
    abbreviation: "SC",
    hasData: true,
    key: "a33",
    dataFlag: "full",
  },
  {
    name: "South Dakota",
    reference: "south-dakota",
    abbreviation: "SD",
    hasData: false,
    key: "a10",
    dataFlag: "no_data_lb",
  },
  {
    name: "Tennessee",
    reference: "tennessee",
    abbreviation: "TN",
    hasData: true,
    key: "a31",
    dataFlag: "full",
  },
  {
    name: "Texas",
    reference: "texas",
    abbreviation: "TX",
    hasData: true,
    key: "a49",
    dataFlag: "full",
  },
  {
    name: "Utah",
    reference: "utah",
    abbreviation: "UT",
    hasData: true,
    key: "a8",
    dataFlag: "full",
  },
  {
    name: "Vermont",
    reference: "vermont",
    abbreviation: "VT",
    hasData: true,
    key: "a43",
    dataFlag: "full",
  },
  {
    name: "Virginia",
    reference: "virginia",
    abbreviation: "VA",
    hasData: false,
    key: "a24",
    dataFlag: "no_data_lb",
    url: "https://vcij.org/stories/virginia-is-in-the-minority-of-states-keeping-even-the-most-basic-police-data-secret",
  },
  {
    name: "Washington",
    reference: "washington",
    abbreviation: "WA",
    hasData: true,
    key: "a0",
    dataFlag: "full",
  },
  {
    name: "West Virginia",
    reference: "west-virginia",
    abbreviation: "WV",
    hasData: true,
    key: "a23",
    dataFlag: "full",
  },
  {
    name: "Wisconsin",
    reference: "wisconsin",
    abbreviation: "WI",
    hasData: false,
    key: "a46",
    dataFlag: "no_data_lb",
    url: "https://wisconsinexaminer.com/2024/05/24/wisconsin-is-in-the-minority-of-states-shielding-police-data-were-suing-to-change-that/",
  },
  {
    name: "Wyoming",
    reference: "wyoming",
    abbreviation: "WY",
    hasData: true,
    key: "a9",
    dataFlag: "full",
  },
];

export const STATE_DESCRIPTIONS = {
  alabama:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  alaska:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  arizona:
    "<p>Data about law enforcement officers in Arizona were obtained under the Arizona Public Records Law from the <a href='https://post.az.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Arizona Peace Officer Standards and Training Board</a>. The data released includes personnel and employment history for all officers certified by the POST, with data going back to the 1950s. The data were last updated in May 2023, and were processed by John Kelly of CBS News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/AZ/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  arkansas:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  california:
    "<p>Data about law enforcement officers in California were obtained under the California Public Records Act from the <a href='https://post.ca.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>California Commission on Peace Officer Standards and Training</a> and the <a href='https://www.cdcr.ca.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>California Department of Corrections and Rehabilitation</a>.</p><p>The two databases come from separate data systems, and do not share a unique identifier. No matching has been done between the two. If an individual worked in both law enforcement and corrections, they would appear in this data twice. However, the fact of a name appearing in both datasets does not necessarily mean that it is the same person. POST and CDCR data were last updated in 2023, and obtained by <a href='https://bsky.app/profile/whosthatcop.bsky.social' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>@WhosThatCop</a> and the California Reporting Project respectively. Both datasets were processed by Tarak Shah of the Human Rights Data Analysis Group. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/CA/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p><p>Access to <a href='https://post.ca.gov/CPRA-Requests' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>California POST data</a> was established by the California Supreme Court in <a href='https://caselaw.findlaw.com/court/ca-supreme-court/1387579.html' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'><i>Commission on Peace Officer Standards and Training v. Superior Court of Sacramento County</i></a>.</p>",
  colorado:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  connecticut:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  delaware:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  columbia:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  florida:
    "<p>Data about law enforcement officers in Florida were obtained under the Florida Sunshine Law from the <a href='https://www.fdle.state.fl.us/CJSTC' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Florida Department of Law Enforcement</a>. The data released includes personnel information, certification information, employment history, complaints and disciplinary actions for all officers certified in the state, with data going back to the 1940s. The data were last updated in April 2023, and were processed by John Kelly of CBS News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/FL/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  "florida-discipline":
    "<p>This table shows sustained allegations of misconduct by Florida law enforcement officers, as reported to the <a href='https://www.fdle.state.fl.us/CJSTC' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Florida Department of Law Enforcement</a> and released under the Florida Sunshine Law. Various forms of sustained investigations of misconduct are reported by local police departments to the Florida Department of Law Enforcement, as detailed on their <a href='https://www.fdle.state.fl.us/CJSTC/Professional-Compliance/PC-Initiation-of-Misconduct.aspx' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Professional Compliance page</a>.</p><p>Only some specific cases that were sustained, in which an officer was disciplined, or in which an officer was arrested are reported to FDLE and available in this data tool. It does not include any cases in which the local department did not discipline the officer. Information about penalties issued by FDLE can be found <a href='https://www.fdle.state.fl.us/CJSTC/Professional-Compliance/PC-Violations-and-Penalties.aspx' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>. The data were last updated in April 2023, and were processed by Ayyub Ibrahim of the Louisiana Law Enforcement Accountability Database.</p>",
  georgia:
    "<p>Data about law enforcement officers in Georgia were obtained under the Georgia Open Records Act from the <a href='https://gapost.org/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Georgia Peace Officer Standards & Training Council</a>. The dataset includes information on all certified peace and corrections officers, with work history data dating back to the early 1990s. While there is some data from earlier years, it is of lower quality, covering less than five hundred officers. The data were last updated in May 2024 and were processed by Ayyub Ibrahim of the Louisiana Law Enforcement Accountability Database. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/GA/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p><p>The data include police and correctional officers. They do not include information on federal law enforcement officers.</p>",
  "georgia-discipline":
    "<p>This table shows arrests and sustained allegations of misconduct by Georgia law enforcement officers, as reported to the <a href='https://gapost.org/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Georgia Peace Officer Standards & Training Council</a> and released under the Georgia Open Records Act. Various forms of sustained investigations of misconduct are reported by local police departments to the Georgia POST. Only some specific cases that were sustained, or in which an officer was disciplined or arrested are available in this data tool.</p>",
  hawaii:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  idaho:
    "<p>Data about law enforcement officers in Idaho were obtained under the Idaho Public Records Law from the <a href='https://post.idaho.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Idaho Peace Officer Standards and Training</a>. The data released includes personnel and employment history for officers certified by the POST. The data were last updated in May 2025, and were processed by Ayyub Ibrahim of the Berkeley Institute for Data Science. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/preprocess/clean/ID/src/src.ipynb' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  illinois:
    "<p>Data about law enforcement in Illinois were obtained under the Illinois Freedom of Information Act from the <a href='https://www.ptb.illinois.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Illinois Law Enforcement Training and Standards Board</a>. The data released includes personnel information, license and certification information, and employment history for all officers certified in the state, with data going back to the 1960s. The data were last updated in August 2024, and were processed by John Kelly of CBS News and Ayyub Ibrahim of the Louisiana Law Enforcement Accountability Database. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/IL/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p><p>ILETSB also publishes a <a href='https://www.ptb.illinois.gov/resources/officer-lookup/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>public lookup tool for police employment history</a>. This tool requires knowledge of the officer in question's name. It is more current than our data, and can be used to ensure that information from our database is accurate.</p>",
  indiana:
    "<p>Data about law enforcement in Indiana were obtained under the Indiana Access to Public Records Act from the <a href='https://www.in.gov/ilea/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Indiana Law Enforcement Academy</a>. The data released includes personnel and employment history for all officers certified by the ILEA, with data going back to the 1970s. The data were last updated in August 2024 by Emily Hopkins of Mirror Indy. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/preprocess/clean' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  iowa: "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  kansas:
    "<p>Data about law enforcement in Kansas were obtained under the Kansas Open Records Act from the <a href='https://www.kscpost.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Kansas Commission on Peace Officers' Standards and Training</a>. The data released includes personnel and employment history for all officers certified by CPOST. The data were last updated in December 2024, and were processed by Tarak Shah and Larry Barrett. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/preprocess/clean' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  kentucky:
    "<p>Data about law enforcement in Kentucky were obtained under the Kentucky Open Records Act from the <a href='https://klecs.ky.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Kentucky Law Enforcement Council</a>. The data were last updated in October 2022.</p>",
  louisiana:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  maine:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  maryland:
    "<p>Data about law enforcement in Maryland were obtained under the Maryland Public Information Act from the <a href='https://www.dpscs.state.md.us/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Maryland Department of Public Safety and Correctional Services</a>. The data released includes personnel information and employment history for all officers certified in the state, with data going back to the 1960s. The data were last updated in August 2022, and were processed by John Kelly of CBS News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/MD/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  massachusetts:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  michigan:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  minnesota:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  mississippi:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  missouri:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  montana:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  nebraska:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  nevada:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "new-hampshire":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "new-jersey":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "new-mexico":
    "<p>Data about law enforcement in New Mexico were obtained under the New Mexico Inspection of Public Records Act from the <a href='https://www.lea.nm.gov/law-enforcement-certification-board/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>New Mexico Law Enforcement Agency</a>. The data released includes personnel and employment history for all officers certified by NMLEA's Law Enforcement Certification Board and its predecessor, with data going back to the 1960s. The data were last updated in June 2023. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/preprocess/clean' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  "new-york":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "north-carolina":
    "<p>Data about law enforcement in North Carolina were obtained under the North Carolina Public Records Act from the <a href='https://ncdoj.gov/law-enforcement-training/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>North Carolina Department of Justice</a>. The data released includes personnel and employment history for all officers certified by NCDOJ's Criminal Justice Education & Training Standards Commission and Sheriffs' Education & Training Standards Commission, with data going back to the 1970s. The data were last updated in August 2023. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/preprocess/clean' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  "north-dakota":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  ohio: "<p>Data about law enforcement in Ohio were obtained under the Ohio Public Records Act from the <a href='https://opota.ohioattorneygeneral.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Ohio Peace Officer Training Commission</a>. The data released includes personnel and employment history for all officers certified in the state, with data going back to the 1950s. The data were last updated in November 2024, and were processed by John Kelly of CBS News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/OH/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  oklahoma:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  oregon:
    "<p>Data about law enforcement in Oregon were obtained under the Oregon Public Records Law from the <a href='https://www.oregon.gov/dpsst/cj/pages/default.aspx' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Oregon Department of Public Safety Standards and Training</a>. The data released includes certified police officers, corrections officers, and parole/probation officers with work history data going back into the 1970s. The data were last updated in September 2022, and were processed by Justin Mayo of Big Local News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/OR/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  pennsylvania:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "rhode-island":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  "south-carolina":
    "<p>Data about law enforcement in South Carolina were obtained under the South Carolina Freedom of Information Act from the <a href='https://sccja.sc.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>South Carolina Criminal Justice Academy</a>. The data released includes certified police officers, corrections officers, and parole/probation officers with work history data going back into the 1970s. The data were last updated in July 2023, and were processed by Justin Mayo of Big Local News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/SC/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  "south-dakota":
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  tennessee:
    "<p>Data about law enforcement in Tennessee were obtained under the Tennessee Public Records Act from the <a href='https://www.tn.gov/commerce/post.html' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Tennessee Peace Officer Standards & Training Commission</a>. The dataset includes information on all certified peace and corrections officers, with work history data dating back to the mid 1980s. The data were originally obtained by Paige Pfleger of WPLN News in June 2023. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/TN/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  texas:
    "<p>Data about law enforcement in Texas were obtained under the Texas Public Information Act from the <a href='https://www.tcole.texas.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Texas Commission on Law Enforcement</a>. The data released includes certification information and employment history for all officers certified in the state, with data going back to the 1930s. The data were last updated in September 2023, and were processed by John Kelly of CBS News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/bln/TX' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  utah: "<p>Data about law enforcement in Utah were obtained under the Utah Government Records Access and Management Act from <a href='https://post.utah.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Utah Peace Officer Standards and Training</a>. The data were obtained in July 2024 after a public records appeal on behalf of the Utah Investigative Journalism Project. Information about disciplinary actions taken by Utah POST is compiled by the Utah Criminal Justice Institute.</p>",
  vermont:
    "<p>Data about law enforcement in Vermont were obtained under the Vermont Public Records Law from the <a href='https://vcjc.vermont.gov/about-us' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Vermont Criminal Justice Council</a>. The data released includes certification information and employment history for all certified police officers, with work history data going back into the late 1970s. The data were last updated in October 2022 and were processed by Justin Mayo of Big Local News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/VT/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  virginia:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  washington:
    "<p>Data about law enforcement in Washington were obtained under the Washington Public Records Act from the <a href='https://www.cjtc.wa.gov/certification/certification-information' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Washington Criminal Justice Training Commission</a>. The data released includes certification information and employment history for all certified police officers, with work history data going back into the late 1970s. The data were last updated in November 2022 and were processed by Justin Mayo of Big Local News. Read more about the data processing <a href='https://github.com/ayyubibrahimi/us-post-data/blob/main/bln/WA/README.md' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  "west-virginia":
    "<p>Data about law enforcement in West Virginia were obtained under the West Virginia Freedom of Information Act from the <a href='https://das.wv.gov/JCS/law-enforcement/Pages/default.aspx' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>West Virginia Law Enforcement Professional Standards Program</a>. The data were last updated in November 2024 by Kyle Vass of Dragline/ACLU of West Virginia. Read more about the processing <a href='https://github.com/ayyubibrahimi/us-post-data/tree/main/preprocess/clean' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>here</a>.</p>",
  wisconsin:
    "<p>Information about this state's peace officer employment history database is currently unavailable.</p>",
  wyoming:
    "<p>Data about law enforcement in Wyoming were obtained under the Wyoming Public Records Act from the <a href='https://post.wyo.gov/' target='_blank' rel='noopener noreferrer' class='text-emerald-700 hover:underline'>Wyoming Peace Officer Standards and Training Commission</a>. The data were originally obtained by WyoFile and Invisible Institute. The data were last updated in March 2023.</p>",
};
