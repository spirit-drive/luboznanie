import { DropDownIcon } from '@/shared/ui/Tag/DropDownIcon/DropDownIcon';
import { TagOrigin } from '@/shared/ui/Tag/TagOrigin/TagOrigin';
import { TagText } from '@/shared/ui/Tag/TagText/TagText';
import { TagWithIcon } from '@/shared/ui/Tag/TagWithIcon/TagWithIcon';

export default function Home() {
  return (
    <div id="root">
      <TagOrigin>text</TagOrigin>
      <TagText text={'text2'}></TagText>
      <TagWithIcon text={'TagWithIcon'} showDeleteIcon={true} iconName={'delete'}></TagWithIcon>
      <DropDownIcon iconName={'delete'}/>
    </div>
  );
}
