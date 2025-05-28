'use client';
import React from 'react';
import styles from './styles.module.scss';

interface Statistic {
  value: string | number;
  label: string;
  literal?: boolean;
}

interface PageHeaderProps {
  home?: boolean;
  title: string;
  description?: string | React.ReactNode;
  statistics?: Statistic[];
}

export default function PageHeader({ home, title, description, statistics }: PageHeaderProps) {
  return (
    <div className={`container-a mx-auto flex lg:flex-row flex-col justify-between lg:items-end items-start ${styles.pageHeader} ${home && styles.homeHeader}`}>
      <div className='w-full flex flex-col justify-start items-start'>
        <h1 className={'self-stretch justify-start text-[#122823] font-bold font-["Inter"] tracking-[.01em] leading-[1.2] ' + styles.title}>
          {title}
        </h1>
        {description && <div className={'self-stretch justify-start text-[#122823] font-normal font-["Inter"] tracking-[-.01em] leading-[1.5] ' + styles.description}>
          {description}
        </div>}
      </div>

      {statistics && statistics.length > 0 && (
        <div className={`flex flex-col justify-center items-start gap-8 ${styles.statistics}`}>
          {statistics.filter(stat => stat.value !== 0 && stat.value).map((stat, index) => (
            <div key={index} className='flex flex-col justify-start items-start gap-2'>
              <div className={'justify-start text-[#2F5E50] font-bold font-["Inter"] tracking-[.01em] leading-[1.2] ' + styles.statValue}>
                {typeof stat.value === 'number' && !stat.literal
                  ? stat.value.toLocaleString('en-US')
                  : stat.value
                }
              </div>
              <div className={'self-stretch justify-start text-emerald-700 font-semibold font-["Inter"] tracking-[-.01em] leading-[1.5] ' + styles.statLabel}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
