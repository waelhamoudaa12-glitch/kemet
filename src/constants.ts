
import { Palette, Layout, Maximize2, DoorOpen, Lamp, Bath, Utensils } from 'lucide-react';
import { Style, Category } from './types';

export const STYLES: Style[] = [
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
    image: 'https://images.unsplash.com/photo-1513519245088-0e12902e35a38?auto=format&fit=crop&q=80&w=800',
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

export const CATEGORIES: Category[] = [
  {
    id: 'walls',
    name: 'الحوائط',
    icon: Palette,
    options: [
      { id: 'w1', name: 'أبيض كلاسيكي (Antique White)', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800', color: '#FAF9F6' },
      { id: 'w2', name: 'كحلي ملكي (Navy Blue)', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=800', color: '#000080' },
      { id: 'w3', name: 'بيج كلاسيكي (Soft Taupe)', image: 'https://images.unsplash.com/photo-1544450181-11af509cd90e?auto=format&fit=crop&q=80&w=800', color: '#776E64' },
      { id: 'w4', name: 'أخضر ملكي (Hunter Green)', image: 'https://images.unsplash.com/photo-1595166411979-5e72c8466f27?auto=format&fit=crop&q=80&w=800', color: '#355E3B' },
      { id: 'w5', name: 'بورجوندي فاخر (Burgundy)', image: 'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?auto=format&fit=crop&q=80&w=800', color: '#800020' },
      { id: 'w6', name: 'أزرق صخري (Slate Blue)', image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800', color: '#708090' },
      { id: 'w7', name: 'أحمر عميق (Deep Red)', image: 'https://images.unsplash.com/photo-1615529328331-f8917597711f?auto=format&fit=crop&q=80&w=800', color: '#8B0000' },
      { id: 'w8', name: 'كريمي (Cream)', image: 'https://images.unsplash.com/photo-1544450181-11af509cd90e?auto=format&fit=crop&q=80&w=800', color: '#FFFDD0' },
    ]
  },
  {
    id: 'floors',
    name: 'الأرضيات',
    icon: Layout,
    options: [
      { id: 'f1', name: 'باركيه بلوط فاتح', image: 'https://images.unsplash.com/photo-1581850518616-bcb8077fa2aa?auto=format&fit=crop&q=80&w=800' },
      { id: 'f2', name: 'رخام كلكتا إيطالي', image: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7?auto=format&fit=crop&q=80&w=800' },
      { id: 'f3', name: 'تيرازو مودرن', image: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?auto=format&fit=crop&q=80&w=800' },
      { id: 'f4', name: 'خرسانة مصقولة ناعمة', image: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'ceilings',
    name: 'الأسقف',
    icon: Maximize2,
    options: [
      { id: 'c1', name: 'جبسوم بورد بتصميم فلات', image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&q=80&w=800' },
      { id: 'c2', name: 'نظام إضاءة خطي مخفي', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
      { id: 'c3', name: 'سقف معلق خشب طبيعي', image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'doors',
    name: 'الأبواب',
    icon: DoorOpen,
    options: [
      { id: 'd1', name: 'باب سمارت مخفي', image: 'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&q=80&w=800' },
      { id: 'd2', name: 'خشب أرو ماسيف كلاسيك', image: 'https://images.unsplash.com/photo-1506377295352-e3154d43ea9e?auto=format&fit=crop&q=80&w=800' },
      { id: 'd3', name: 'أبواب حديدية زجاجية (Slim)', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'lighting',
    name: 'الإضاءة',
    icon: Lamp,
    options: [
      { id: 'l1', name: 'تراك لايت مغناطيسي', image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&q=80&w=800' },
      { id: 'l2', name: 'نجف مودرن بتصميم بسيط', image: 'https://images.unsplash.com/photo-1543248939-ff40856f65d4?auto=format&fit=crop&q=80&w=800' },
      { id: 'l3', name: 'إضاءة ذكية قابلة للتحكم', image: 'https://images.unsplash.com/photo-1553095066-5014bd703995?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'bathrooms',
    name: 'الحمامات',
    icon: Bath,
    options: [
      { id: 'b1', name: 'نظام فندقي أسود مط', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800' },
      { id: 'b2', name: 'ترافرتينو ورخام كلاسيك', image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&q=80&w=800' },
      { id: 'b3', name: 'خلاطات نحاسية عصرية', image: 'https://images.unsplash.com/photo-1620626011761-9963d7b59a763?auto=format&fit=crop&q=80&w=800' },
    ]
  },
  {
    id: 'kitchen',
    name: 'المطبخ',
    icon: Utensils,
    options: [
      { id: 'k1', name: 'أكريليك هاي جلوس عصري', image: 'https://images.unsplash.com/photo-1556912177-c54030239c75?auto=format&fit=crop&q=80&w=800' },
      { id: 'k2', name: 'خشب طبيعي بنمط ريفي', image: 'https://images.unsplash.com/photo-1600489000022-c2086d79f9d4?auto=format&fit=crop&q=80&w=800' },
      { id: 'k3', name: 'نظام مطابخ بولي لاك نانو', image: 'https://images.unsplash.com/photo-1565182999561-18d7dc63c391?auto=format&fit=crop&q=80&w=800' },
    ]
  }
];
