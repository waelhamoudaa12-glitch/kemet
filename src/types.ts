
export interface Option {
  id: string;
  name: string;
  image: string;
  color?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: any;
  iconName?: string;
  options: Option[];
}

export interface Style {
  id: string;
  name: string;
  description: string;
  image: string;
}
