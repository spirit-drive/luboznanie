import s from './page.module.scss';
import { CommonExercise } from '@/components/entities/practices/CommonExercise/CommonExercise';

export default function Page() {
  return (
    <div className={s.page}>
      <CommonExercise />
    </div>
  );
}
