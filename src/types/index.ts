export type IconName =
  | 'twitter'
  | 'instagram'
  | 'linkedin'
  | 'github'
  | 'youtube'
  | 'tiktok'
  | 'code'
  | 'laptop'
  | 'book'
  | 'bulb'
  | 'briefcase'
  | 'link';

export interface ConstellationLink {
  id: string;
  label: string;
  icon: IconName;
  url: string;
  openModal?: boolean;
}

export interface ConstellationData {
  id: string;
  label: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  links: ConstellationLink[];
  modalLinks?: ConstellationLink[];
}
