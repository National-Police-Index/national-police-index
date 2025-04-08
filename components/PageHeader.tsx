interface Statistic {
  value: string | number;
  label: string;
}

interface PageHeaderProps {
  title: string;
  description: string;
  statistics?: Statistic[];
}

export default function PageHeader({ title, description, statistics }: PageHeaderProps) {
  return (
    <div className='mx-auto lg:py-28 py-12 flex gap-8 lg:flex-row flex-col justify-between lg:items-end items-start'>
      <div className='w-full flex flex-col justify-start items-start gap-8'>
        <div className='w-5/6 justify-start text-emerald-950 text-5xl font-bold font-["Inter"] tracking-wide'>
          {title}
        </div>
        <div className='self-stretch justify-start text-emerald-950 text-lg font-normal font-["Inter"] tracking-wide'>
          {description}
        </div>
      </div>

      {statistics && statistics.length > 0 && (
        <div className='flex flex-col justify-center items-start gap-8'>
          {statistics.map((stat, index) => (
            <div key={index} className='w-5/6 flex flex-col justify-start items-start gap-2'>
              <div className='justify-start text-V7 text-7xl font-bold font-["Inter"] tracking-wide'>
                {stat.value}
              </div>
              <div className='self-stretch justify-start text-slate-500 text-lg font-semibold font-["Inter"] tracking-wide'>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
