import PageHeader from '@/components/PageHeader';
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
    <div className="w-full mx-auto">
      <PageHeader
        title='About us'
      />

      <div className="w-full bg-white rounded-tl-3xl rounded-tr-3xl pt-12 ">
        <div className="w-5/6 mx-auto ">


          {/* Main Content */}
          <section className="relative w-full mx-auto 28 pt-4 pb-14">
            <div className="relative">
              {/* Image - Floating right on desktop, full width on mobile */}
              <div className="float-none w-full mb-6 sm:float-right sm:w-[300px] md:w-[400px] lg:w-[500px] sm:ml-8 sm:mb-4">
                <img
                  className="w-full h-auto aspect-square object-cover"
                  src="https://placehold.co/600x600"
                  alt="About illustration"
                />
              </div>

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
                  Access the underlying data files for the National Police Index at this <Link href="#" className="underline">link</Link>.
                </p>
              </div>

              {/* Clear float */}
              <div className="clear-both"></div>
            </div>
          </section>

          {/* Team Section */}
          <section className="w-full py-14">
            <div className="w-full pt-4 border-t border-emerald-950 inline-flex justify-start items-center gap-2.5">
              <div className="justify-start text-emerald-950 text-4xl font-bold font-['Inter'] leading-[48px] tracking-tight">Team</div>
            </div>

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
      </div>
    </div>
  );
}
