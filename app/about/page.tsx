'use client';

import PageHeader from '@/components/PageHeader';
import Image from 'next/image';
import Link from 'next/link';
import TeamCard from '@/components/team/TeamCard';
import { useTeam } from '@/hooks/useTeam';
import { usePartners } from '@/hooks/usePartners';
import aboutImage from '@/images/about-image.png';
import styles from './page.module.scss';

export default function AboutPage() {
  const { loading, error, teamMembers } = useTeam();
  const { loading_p, error_p, partners } = usePartners();
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
                  The National Police Index is a project and data tool showing police employment history data obtained from state police training and certification boards across the U.S. All but one state has such a system.
                </p>

                <p>
                  The National Police Index is a public data project led by reporter Sam Stecklow of Invisible Institute, a nonprofit public accountability journalism organization based in Chicago, created in partnership with Ayyub Ibrahim of the Berkeley Institute for Data Science, and Tarak Shah of the Human Rights Data Analysis Group.
                </p>

                <p>
                  The data tool was created by Ayyub Ibrahim with contributions from Tarak Shah, Olive Lavine and Maheen Khan.
                </p>

                <p>
                  The data files were collected over the course of over two years by a coalition of news and legal organizations. In addition to Invisible Institute, these included reporters, students, attorneys, and others with Big Local News at Stanford, CBS News, Hearst Newspapers, California Reporting Project, Howard Center for Investigative Journalism at the University of Maryland, ABC Owned & Operated Stations, American Public Media Research Lab, WPLN, Utah Investigative Journalism Project/Utah Freedom of Information Hotline, University of North Carolina at Chapel Hill, Oregon Public Broadcasting, Washington City Paper/George Washington University Public Justice Advocacy Clinic, Tony Webster, WyoFile, Dragline/ACLU of West Virginia, and Mirror Indy.
                </p>

                <p>
                  Efforts are being and were made to obtain data in states that have made it inaccessible by Invisible Institute and Colorado Springs Gazette/Reporters Committee for Freedom of the Press, Detroit Metro Times/University of Michigan Civil Rights Litigation Initiative, Delaware Call/ACLU of Delaware, Hearst Newspapers, MuckRock/University of Virginia First Amendment Clinic, The Badger Project/Wisconsin Transparency Project/University of Illinois First Amendment Clinic, Louisiana Law Enforcement Accountability Database/Innocence Project New Orleans, AL.com, Arkansas Advocate, The Frontier, SpotlightPA/Pennsylvania NewsMedia Association, and Sioux Falls Argus Leader.
                </p>

                <p>
                  Access the underlying data files for the National Police Index at this <Link href="https://github.com/National-Police-Index/us-post-data" className="underline">link</Link>.
                </p>
              </div>

              {/* Clear float */}
              <div className="clear-both"></div>
            </div>
          </section>

          {/* Team Section */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-4xl font-bold font-['Inter'] leading-[48px] tracking-tight">Team</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading team members...</p>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-12">{error.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.teamSection}`}>
                  {teamMembers.map((member) => (
                    <TeamCard
                      key={member.name}
                      name={member.name}
                      pronouns={member.pronouns}
                      description={member.description}
                    />
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Partners/Collaborators Section */}
          <section className="w-full">
            <div className="w-full pt-4 border-t border-[#2F5E50] inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-[#122823] text-4xl font-bold font-['Inter'] leading-[48px] tracking-tight">Partners and Collaborators</div>
            </div>

            <div className={`w-full mx-auto`}>
              {loading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="ml-4 ">Loading partners...</p>
                </div>
              ) : error ? (
                <div className="text-red-600 text-center py-12">{error.message}</div>
              ) : (
                <div className={`w-full flex flex-wrap gap-6 ${styles.partnerSection}`}>
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
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
