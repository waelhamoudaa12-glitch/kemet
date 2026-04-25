
import { Palette, Layout, Maximize2, DoorOpen, Lamp, Bath, Utensils } from 'lucide-react';

export const STYLES = [
  {
    id: 'modern',
    name: 'مودرن (Modern)',
    description: 'خطوط نظيفة، ألوان محايدة، وتصميم عصري يعتمد على البساطة والوظيفة.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'classic',
    name: 'كلاسيك (Classic)',
    description: 'تفاصيل معمارية أنيقة، إضاءة دافئة، وفخامة خالدة تعكس الرقي.',
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'neoclassic',
    name: 'نيو كلاسيك (Neo-Classic)',
    description: 'مزيج مثالي بين فخامة الكلاسيك وبساطة المودرن بتوازن دقيق.',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'minimalist',
    name: 'المينيمال (Minimalist)',
    description: 'البساطة هي كل شيء. مساحات خالية من الفوضى تركز على الجوهر.',
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'industrial',
    name: 'الاندستريال (Industrial)',
    description: 'طوب مكشوف، معادن غامقة، ومظهر جريء مستوحى من المصانع القديمة.',
    image: 'https://images.unsplash.com/photo-1505673542670-a5e3ff5b14a3?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'scandinavian',
    name: 'الاسكندنافي (Scandinavian)',
    description: 'إضاءة طبيعية، أخشاب فاتحة، وجو مريح وهادئ مستوحى من الشمال.',
    image: 'https://images.unsplash.com/photo-1555181126-cf46a03827c0?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'bohemian',
    name: 'البوهيمي (Bohemian)',
    description: 'ألوان حيوية، نباتات بكثرة، وتوليفة فنية تعكس الحرية والإبداع.',
    image: 'https://images.unsplash.com/photo-1522758939261-80816d1ee14b?auto=format&fit=crop&q=80&w=800',
  }
];

export const CATEGORIES = [
  {
    id: 'walls',
    name: 'الحوائط',
    icon: Palette,
    options: [
      { id: 'w1', name: 'أبيض ناصع (Matt)', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800', color: '#FFFFFF' },
      { id: 'w2', name: 'لؤلؤي دافئ (Silk)', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=800', color: '#F5F5DC' },
      { id: 'w3', name: 'رمادي خرساني', image: 'https://images.unsplash.com/photo-1544450181-11af509cd90e?auto=format&fit=crop&q=80&w=800', color: '#808080' },
      { id: 'w4', name: 'ورق حائط مودرن', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=800' },
      { id: 'w5', name: 'تجاليد خشبية', image: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'floors',
    name: 'الأرضيات',
    icon: Layout,
    options: [
      { id: 'f1', name: 'باركيه طبيعي', image: 'https://images.unsplash.com/photo-1516455590571-18256e5bb9ff?auto=format&fit=crop&q=80&w=800' },
      { id: 'f2', name: 'رخام ستاتواربو', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
      { id: 'f3', name: 'بورسلين رمادي', image: 'https://images.unsplash.com/photo-1599619351208-3e6c839d76d1?auto=format&fit=crop&q=80&w=800' },
      { id: 'f4', name: 'إيبوكسي عصري', image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'ceilings',
    name: 'الأسقف',
    icon: Maximize2,
    options: [
      { id: 'c1', name: 'جبسوم بورد فلات', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800' },
      { id: 'c2', name: 'بيت نور مخفي', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
      { id: 'c3', name: 'سقف معلق خشب', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'doors',
    name: 'الأبواب',
    icon: DoorOpen,
    options: [
      { id: 'd1', name: 'باب مخفي (Smart)', image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&q=80&w=800' },
      { id: 'd2', name: 'خشب أرو ماسيف', image: 'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?auto=format&fit=crop&q=80&w=800' },
      { id: 'd3', name: 'ألمنيوم وزجاج', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'lighting',
    name: 'الإضاءة',
    icon: Lamp,
    options: [
      { id: 'l1', name: 'Magnetic Tracks', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
      { id: 'l2', name: 'نجف كريستال عصفور', image: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&q=80&w=800' },
      { id: 'l3', name: 'إضاءة ذكية App Control', image: 'https://images.unsplash.com/photo-1553095066-5014bd703995?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'bathrooms',
    name: 'الحمامات',
    icon: Bath,
    options: [
      { id: 'b1', name: 'نظام فندقي أسود', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
      { id: 'b2', name: 'رخامي وترافرتينو', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800' },
      { id: 'b3', name: 'خلاطات دفن ذهبية', image: 'https://images.unsplash.com/photo-1620626011761-9963d7b59a763?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'kitchen',
    name: 'المطبخ',
    icon: Utensils,
    options: [
      { id: 'k1', name: 'Acrylic High Gloss', image: 'https://images.unsplash.com/photo-1556912177-c54030239c75?auto=format&fit=crop&q=80&w=800' },
      { id: 'k2', name: 'خشب طبيعي روستيك', image: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80&w=800' },
      { id: 'k3', name: 'نظام بولي لاك نانو', image: 'https://images.unsplash.com/photo-1565182999561-18d7dc63c391?auto=format&fit=crop&q=80&w=800' },
    ]
  }
];
