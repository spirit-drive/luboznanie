'use client';

import React from 'react';
import clsx from 'clsx';
import s from './CommonExercise.module.scss';
import { TextEditor } from '@/components/shared/TextEditor/TextEditor';

export type CommonExerciseProps = {
  className?: string;
};

export const CommonExercise = ({ className }: CommonExerciseProps) => {
  console.log('CommonExercise');
  return (
    <div className={clsx(s.root, className)}>
      <TextEditor />
    </div>
  );
};
