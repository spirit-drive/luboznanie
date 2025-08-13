export type IconProps = React.HTMLAttributes<HTMLElement> & {
  name: string;
  className?: string;
  size?: number;
  svgProps?: React.SVGAttributes<SVGElement>;
  ref?: React.Ref<HTMLElement>;
};