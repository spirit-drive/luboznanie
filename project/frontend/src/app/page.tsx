'use client';
import { EditableText } from '@/components/EditableText/EditableText';
import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState<string>('initial text');
  return (
    <div id="root">
      <EditableText onSetChange={setText} value={text} />
    </div>
  );
}
