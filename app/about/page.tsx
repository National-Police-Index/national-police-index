import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About Us | National Police Index',
  description: 'Learn about our mission to promote transparency and accountability in law enforcement through comprehensive police officer records.',
};

interface TeamMember {
  name: string;
  pronouns: string;
  description: string;
}

const teamMembers: TeamMember[] = Array(12).fill({
  name: 'Sam Stecklow',
  pronouns: 'he/him',
  description: 'An investigative journalist and FOIA fellow with Invisible Institute. He works on Invisible Institute\'s Civic Police Data Project and investigations.',
});

export default function AboutPage() {
  return (
    <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* About Section */}
      <section className="w-full px-28 py-14">
        <h1 className="text-4xl font-bold font-inter leading-[48px] tracking-tight mb-10">About us</h1>
      </section>

      <div data-layer="About" className="About w-[1440px] px-28 bg-white inline-flex justify-start items-end gap-6 overflow-hidden">
  <div data-layer="The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S. All but one state has such a system. The National Police Index is a public data project led by reporter Sam Stecklow of Invisible Institute, a nonprofit public accountability journalism organization based in Chicago, created in partnership with Ayyub Ibrahim of the Berkeley Institute for Data Science, and Tarak Shah of the Human Rights Data Analysis Group. Access to this data helps show potential 'wandering officers,' and is intended for use by residents, journalists, researchers, attorneys, and other stakeholders. Information about the age, source, and other specifics for each state is available on each page. Each state's database is closed to the others; names are common, and an officer's name appearing in two states does not necessarily mean they are the same person. Specific records should be sought from state training boards and individual police departments to confirm the identity of an individual whose name appears in multiple states. In total, 27 states have released centralized employment history data, 23 of which are currently represented on the data tool." className="TheNationalPoliceIndexIsAProjectAndDataToolShowingPoliceEmploymentHistoryDataObtainedFromStatePoliceTrainingAndCertificationBoardsAcrossTheUSAllButOneStateHasSuchASystemTheNationalPoliceIndexIsAPublicDataProjectLedByReporterSamStecklowOfInvisibleInstituteANonprofitPublicAccountabilityJournalismOrganizationBasedInChicagoCreatedInPartnershipWithAyyubIbrahimOfTheBerkeleyInstituteForDataScienceAndTarakShahOfTheHumanRightsDataAnalysisGroupAccessToThisDataHelpsShowPotentialWanderingOfficersAndIsIntendedForUseByResidentsJournalistsResearchersAttorneysAndOtherStakeholdersInformationAboutTheAgeSourceAndOtherSpecificsForEachStateIsAvailableOnEachPageEachStateSDatabaseIsClosedToTheOthersNamesAreCommonAndAnOfficerSNameAppearingInTwoStatesDoesNotNecessarilyMeanTheyAreTheSamePersonSpecificRecordsShouldBeSoughtFromStateTrainingBoardsAndIndividualPoliceDepartmentsToConfirmTheIdentityOfAnIndividualWhoseNameAppearsInMultipleStatesInTotal27StatesHaveReleasedCentralizedEmploymentHistoryData23OfWhichAreCurrentlyRepresentedOnTheDataTool w-[600px] justify-start text-black text-lg font-normal font-['Inter'] leading-relaxed">The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S. All but one state has such a system.<br/>The National Police Index is a public data project led by reporter Sam Stecklow of Invisible Institute, a nonprofit public accountability journalism organization based in Chicago, created in partnership with Ayyub Ibrahim of the Berkeley Institute for Data Science, and Tarak Shah of the Human Rights Data Analysis Group.<br/>Access to this data helps show potential "wandering officers," and is intended for use by residents, journalists, researchers, attorneys, and other stakeholders. Information about the age, source, and other specifics for each state is available on each page.<br/>Each state's database is closed to the others; names are common, and an officer's name appearing in two states does not necessarily mean they are the same person. Specific records should be sought from state training boards and individual police departments to confirm the identity of an individual whose name appears in multiple states.<br/>In total, 27 states have released centralized employment history data, 23 of which are currently represented on the data tool.</div>
  <img data-layer="Rectangle 3" className="Rectangle3 w-[600px] h-[600px]" src="https://placehold.co/600x600" />
</div>

      {/* Main Content */}
      <section className="w-full px-28 py-14 flex justify-start items-end gap-6 flex-row">
        <div className="">
          <p className="text-lg font-normal font-inter leading-relaxed space-y-4">
            The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S. All but one state has such a system.
            <br/><br/>
            The National Police Index is a public data project led by reporter Sam Stecklow of Invisible Institute, a nonprofit public accountability journalism organization based in Chicago, created in partnership with Ayyub Ibrahim of the Berkeley Institute for Data Science, and Tarak Shah of the Human Rights Data Analysis Group.
          </p>
        </div>
        <div className="relative">
          <Image 
            src="/about.png" 
            alt="About illustration" 
            fill 
            className="object-cover"
          />
        </div>
      </section>

      {/* Additional Information */}
      <section className="w-full px-28 pt-4 pb-14 text-lg font-normal font-inter leading-relaxed">
        <p className="w-full max-w-[1224px] mx-auto space-y-4">
          The data tool was created by Ayyub Ibrahim with contributions from Tarak Shah, Olive Lavine and Maheen Khan.
          <br/><br/>
          The data files were collected over the course of over two years by a coalition of news and legal organizations. In addition to Invisible Institute, these included reporters, students, attorneys, and others with Big Local News at Stanford, CBS News, Hearst Newspapers, California Reporting Project, Howard Center for Investigative Journalism at the University of Maryland, ABC Owned & Operated Stations, American Public Media Research Lab, WPLN, Utah Investigative Journalism Project/Utah Freedom of Information Hotline, University of North Carolina at Chapel Hill, Oregon Public Broadcasting, Washington City Paper/George Washington University Public Justice Advocacy Clinic, Tony Webster, WyoFile, Dragline/ACLU of West Virginia, and Mirror Indy.
          <br/><br/>
          Efforts are being and were made to obtain data in states that have made it inaccessible by Invisible Institute and Colorado Springs Gazette/Reporters Committee for Freedom of the Press, Detroit Metro Times/University of Michigan Civil Rights Litigation Initiative, Delaware Call/ACLU of Delaware, Hearst Newspapers, MuckRock/University of Virginia First Amendment Clinic, The Badger Project/Wisconsin Transparency Project/University of Illinois First Amendment Clinic, Louisiana Law Enforcement Accountability Database/Innocence Project New Orleans, AL.com, Arkansas Advocate, The Frontier, SpotlightPA/Pennsylvania NewsMedia Association, and Sioux Falls Argus Leader.
          <br/><br/>
          Access the underlying data files for the National Police Index at this <Link href="#" className="underline">link</Link>.
        </p>
      </section>

      {/* Team Section */}
      <section className="w-full px-28 py-14">
        <h2 className="text-4xl font-bold font-inter tracking-tight mb-10">Team</h2>
        <div className="w-full mx-auto space-y-6">
          {[0, 1, 2].map((rowIndex) => (
            <div key={rowIndex} className="flex justify-center items-center gap-6">
              {teamMembers.slice(rowIndex * 4, (rowIndex + 1) * 4).map((member, index) => (
                <div key={index} className="w-72 p-4 bg-gray-200 flex flex-col gap-2">
                  <div className="pb-2 border-b border-black flex items-center gap-2">
                    <span className="text-base font-normal font-inter">{member.name}</span>
                    <span className="text-xs font-normal font-inter">({member.pronouns})</span>
                  </div>
                  <div className="text-sm font-normal font-inter leading-relaxed">
                    {member.description.split('Invisible Institute').map((part, i, arr) => (
                      <div key={i} className="flex items-center gap-2">
                        {part}
                        {i < arr.length - 1 && (
                          <Link href="#" className="underline">Invisible Institute</Link>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

   </div>
  );
}
