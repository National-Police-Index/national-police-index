'use client';

import PageHeader from '@/components/PageHeader';
import Image from 'next/image';
import Link from 'next/link';
import TeamCard from '@/components/team/TeamCard';
import { useTeam } from '@/hooks/useTeam';
import { usePartners } from '@/hooks/usePartners';
import { useCurrentContributors } from '@/hooks/useCurContrib';
import { useCoLeads } from '@/hooks/useCoLeads';
import { usePreviousContributors } from '@/hooks/usePrevContrib';
import aboutImage from '@/images/about-image.png';
import styles from './page.module.scss';

export default function AboutPage() {
  const { loading, error, teamMembers } = useTeam();
  const { loading_cl, error_cl, coLeads } = useCoLeads();
  const { loading_p, error_p, partners } = usePartners();
  const { loading_cc, error_cc, currentContributors } = useCurrentContributors();
  const { loading_pc, error_pc, previousContributors } = usePreviousContributors();

  return (
    <div className="w-full mx-auto">
      <PageHeader
        title='About us'
      />
      <div className={`relative w-full bg-white rounded-tl-3xl rounded-tr-3xl z-1 ${styles.pageContentWrapper}`}>
        <div className={`container-a mx-auto ${styles.container}`}>


          {/* Main Content */}
          <section className="relative w-full mx-auto">
            <div className="relative">
              {/* Image - Floating right on desktop, full width on mobile */}
              {false && <div className="float-none w-full mb-6 sm:float-right sm:w-[300px] md:w-[400px] lg:w-[500px] sm:ml-8 sm:mb-4">
                <Image
                  className="w-full h-auto aspect-square object-cover"
                  src={aboutImage}
                  alt="About illustration"
                />
              </div>}

              {/* Text content that wraps around the image */}
              <div className="text-lg font-normal font-inter leading-relaxed space-y-6">
                <p>
                  The National Police Index (NPI) is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S.
                </p>

                <p>
                  The NPI is a public data project run by <Link href="https://invisible.institute/introduction" className="underline" target="_blank">Invisible Institute</Link>, a nonprofit public accountability journalism organization based in Chicago; <Link href="https://hrdag.org/" className="underline" target="_blank">Human Rights Data Analysis Group</Link>, a non-profit, non-partisan organization that applies rigorous science to the analysis of human rights violations around the world, and <Link href="https://mljusticelab.com/" className="underline" target="_blank">Machine Learning Justice Lab</Link>, a start-up that builds open source software designed for human rights research. <Link href="https://justicelouisiana.org/" className="underline" target="_blank">Innocence & Justice Louisiana</Link> was a founding partner. The web tool was developed by <Link href="https://79x.solutions/" className="underline" target="_blank">79X Solutions</Link>.
                </p>
              </div>

              {/* Clear float */}
              <div className="clear-both"></div>
            </div>
          </section>

          {/* Team Section */}
          <section className="w-full">
            <div className="w-full pt-4 border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-4xl font-bold font-['Inter'] leading-[48px] tracking-tight">Team</div>
            </div>

            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-3xl font-bold font-['Inter'] leading-[48px] tracking-tight">Co-Leads</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading_cl ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading co-leads...</p>
                </div>
              ) : error_cl ? (
                <div className="text-red-600 text-center py-12">{error_cl.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.teamSection}`}>
                  {coLeads.map((co_lead) => (
                    <TeamCard
                      key={co_lead.name}
                      name={co_lead.name}
                      pronouns={co_lead.pronouns}
                      description={co_lead.description}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Current Contributors & Volunteers */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-3xl font-bold font-['Inter'] leading-[48px] tracking-tight">Current Contributors & Volunteers</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading_cc ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading current contributors & volunteers...</p>
                </div>
              ) : error_cc ? (
                <div className="text-red-600 text-center py-12">{error_cc.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.teamSection}`}>
                  {currentContributors.map((current) => (
                    <TeamCard
                      key={current.name}
                      name={current.name}
                      pronouns={current.pronouns}
                      description={current.description}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Partners/Collaborators Section */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-3xl font-bold font-['Inter'] leading-[48px] tracking-tight">Partners and Collaborators</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading_p ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading partners...</p>
                </div>
              ) : error_p ? (
                <div className="text-red-600 text-center py-12">{error_p.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.teamSection}`}>
                  {partners.map((partner) => (
                    <TeamCard
                      key={partner.name}
                      name={partner.name}
                      pronouns={partner.pronouns}
                      description={partner.description}
                    />
                  ))}
                </div>
              )}
              <div className="justify-start font-lg font-['Inter'] pt-10 tracking-tight">Legal Support:</div>
              <div className="pl-7">
                <ul className="list-disc font-md">
                  <li className="pt-3 leading-6">Reporters Committee for Freedom of the Press</li>
                  <li className="leading-6">Wisconsin Transparency Project</li>
                  <li className="leading-6">ACLU of Delaware</li>
                  <li className="leading-6">University of Michigan Civil Rights Litigation Initiative</li>
                  <li className="leading-6">University of Virginia First Amendment Clinic</li>
                  <li className="leading-6">George Washington University Public Justice Advocacy Clinic</li>
                  <li className="leading-6">Southern Methodist University First Amendment Clinic</li>
                  <li className="leading-6">Proyecto de Acceso a la Información de la Universidad Interamericana</li>
                  <li className="leading-6">University of Illinois First Amendment Clinic</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Previous Contributors & Volunteers */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-3xl font-bold font-['Inter'] leading-[48px] tracking-tight">Previous Contributors & Volunteers</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading_pc ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading previous contributors and volunteers...</p>
                </div>
              ) : error_pc ? (
                <div className="text-red-600 text-center py-12">{error_pc.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.teamSection}`}>
                  {previousContributors.map((previous) => (
                    <TeamCard
                      key={previous.name}
                      name={previous.name}
                      pronouns={previous.pronouns}
                      description={previous.description}
                    />
                  ))}
                </div>
              )}
              <div className="justify-start font-lg font-['Inter'] pt-10 tracking-tight">Invisible Institute Public Access Legal Externs:</div>
              <div className="pl-7">
                <ul className="list-disc font-md">
                  <li className="pt-3 leading-6">Andra Cernavskis (2026)</li>
                  <li className="leading-6">Kaitlyn Mattox (2026)</li>
                  <li className="leading-6">Makayla Bruno-Smith (2025)</li>
                  <li className="leading-6">Nardien Sadik (2025)</li>
                  <li className="leading-6">Josette Soto (2025)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Text content that wraps around the image */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-3xl font-bold font-['Inter'] leading-[48px] tracking-tight">The Data</div>
            </div>
              <div className="text-lg font-normal font-inter leading-relaxed space-y-6">
                <p></p>
                <p>
                  Data updates for the NPI are maintained by Invisible Institute and partners in three individual states: <br></br> California Reporting Project, Dragline/ACLU of West Virginia, and Mirror Indy.
                </p>
  
                <p>
                  The original data files were initially collected between 2022 and 2024 by a coalition of news and legal organizations. In addition to Invisible Institute, California Reporting Project, Dragline/ACLU of West Virginia, and Mirror Indy, these also included reporters, students, attorneys, and others with Big Local News at Stanford, CBS News, Hearst Newspapers New York, Howard Center for Investigative Journalism at the University of Maryland, ABC Owned & Operated Stations, American Public Media Research Lab, WPLN, Utah Investigative Journalism Project/Utah Freedom of Information Hotline, University of North Carolina at Chapel Hill, Oregon Public Broadcasting, MuckRock/University of Virginia First Amendment Clinic, Washington City Paper/George Washington University Public Justice Advocacy Clinic, WyoFile, and independent journalist Tony Webster.
                </p>

                <p>
                  There are continuing legal and other efforts to obtain data in several jurisdictions by Invisible Institute and Detroit Metro Times/University of Michigan Civil Rights Litigation Initiative, Delaware Call/ACLU of Delaware, Hearst Newspapers New York, The Badger Project/Wisconsin Transparency Project/University of Illinois First Amendment Clinic, Louisiana Law Enforcement Accountability Database/Innocence & Justice Louisiana, The Pulp (Montana)/Morrison, Sherwood, Wilson, & Deola, PLLP, Honolulu Civil Beat, and Kilómetro0/Proyecto de Acceso a la Información de la Universidad Interamericana.
                </p>

                <p>
                  Efforts were made to obtain data in states that have made it inaccessible by Invisible Institute and Colorado Springs Gazette/Reporters Committee for Freedom of the Press, AL.com, Arkansas Advocate, The Frontier, SpotlightPA/Pennsylvania NewsMedia Association, and Sioux Falls Argus Leader. 
                </p>

                <p>
                  Access the underlying data files for the National Police Index at this <Link href="https://github.com/National-Police-Index/us-post-data" className="underline" target="_blank">link</Link>.
                </p>
              </div>
              </section>

        </div>
      </div>
    </div>
  );
}
