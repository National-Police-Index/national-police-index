import { Metadata } from 'next';
import Image from 'next/image';
import { TeamMember } from '@/types';

export const metadata: Metadata = {
  title: 'About Us | National Police Index',
  description: 'Learn about our mission to promote transparency and accountability in law enforcement through comprehensive police officer records.',
};

const teamMembers: TeamMember[] = [
  {
    name: 'Sarah Johnson',
    role: 'Executive Director',
    image: '/team/sarah-johnson.jpg',
    description: 'Former civil rights attorney with 15 years of experience in police accountability.',
  },
  {
    name: 'Michael Chen',
    role: 'Data Director',
    image: '/team/michael-chen.jpg',
    description: 'Data scientist specializing in public records analysis and database management.',
  },
  {
    name: 'Rachel Martinez',
    role: 'Community Outreach',
    image: '/team/rachel-martinez.jpg',
    description: 'Community organizer focused on building partnerships with advocacy groups.',
  },
];

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Mission Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4">
          Our Mission
        </h1>
        <p className="mt-6 text-xl text-gray-500 max-w-3xl mx-auto">
          The National Police Index is dedicated to promoting transparency and accountability
          in law enforcement by providing comprehensive access to police officer employment records
          and certification status across the United States.
        </p>
      </div>

      {/* Values Section */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mb-16">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Transparency</h3>
          <p className="text-gray-500">
            We believe in making law enforcement records easily accessible to the public,
            fostering trust between communities and police departments.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Accountability</h3>
          <p className="text-gray-500">
            By providing accurate and up-to-date information, we help ensure that law
            enforcement officers are held accountable for their actions.
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Public Service</h3>
          <p className="text-gray-500">
            Our work serves the public interest by enabling informed decision-making
            and promoting better policing practices.
          </p>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Team</h2>
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {teamMembers.map((member) => (
            <div key={member.name} className="text-center">
              <div className="relative w-40 h-40 mx-auto mb-4">
                <Image
                  src={member.image}
                  alt={member.name}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">{member.name}</h3>
              <p className="text-blue-600 mb-2">{member.role}</p>
              <p className="text-gray-500">{member.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white rounded-lg shadow-sm p-8 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Contact Us</h2>
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg text-gray-500 mb-6">
            Have questions about our work or want to contribute to our mission?
            We'd love to hear from you.
          </p>
          <a
            href="mailto:contact@nationalpoliceindex.org"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </div>
  );
}
