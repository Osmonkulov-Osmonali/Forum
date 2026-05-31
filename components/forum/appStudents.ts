export interface AppStudent {
  id: string;
  name: string;
  university: string;
  city: string;
  avatarUrl: string;
  /** [latitude, longitude] */
  coordinates: [number, number];
  message: string;
  /** Короткая подсказка для панели рядом с активной карточкой */
  tip: string;
}

// TODO: ЗАМЕНИТЬ ЭТОТ МАССИВ НА РЕАЛЬНЫЕ ДАННЫЕ УЧЕНИКОВ.
export const APP_STUDENTS: AppStudent[] = [
  {
    id: "tokyo",
    name: "Айдана Раимова",
    university: "University of Tokyo",
    city: "Токио",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=aidana-tokyo",
    coordinates: [35.68, 139.69],
    message:
      "Поступила в UTokyo по программе MEXT. Готовлюсь поделиться опытом подготовки к языковым экзаменам и мотивационному письму.",
    tip: "Грант MEXT покрывает обучение и проживание — один из самых щедрых в Азии.",
  },
  {
    id: "newyork",
    name: "Нурлан Исаков",
    university: "Columbia University",
    city: "Нью-Йорк",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=nurlan-nyc",
    coordinates: [40.71, -74.0],
    message:
      "Учусь в Columbia на программе по международным отношениям. Расскажу, как собрать сильное портфолио для топ-вузов США.",
    tip: "Early Decision в Ivy League повышает шансы, но требует ранней подачи — до 1 ноября.",
  },
  {
    id: "london",
    name: "Зарина Бекова",
    university: "UCL",
    city: "Лондон",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=zarina-london",
    coordinates: [51.51, -0.13],
    message:
      "В UCL изучаю архитектуру и урбанистику. Помогу разобраться с UCAS, personal statement и стипендиями Великобритании.",
    tip: "UCAS позволяет подать до 5 заявок одновременно — personal statement один на все.",
  },
  {
    id: "boston",
    name: "Алия Исакова",
    university: "MIT",
    city: "Бостон",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=aliya-mit",
    coordinates: [42.36, -71.06],
    message:
      "На инженерном треке в MIT. Расскажу про олимпиады, research-проекты и как выделиться в заявке на STEM-программы.",
    tip: "MIT ценит research-опыт и олимпиады больше, чем количество внешкольных кружков.",
  },
  {
    id: "singapore",
    name: "Айзат Кенжебаева",
    university: "NUS",
    city: "Сингапур",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=aizat-nus",
    coordinates: [1.35, 103.82],
    message:
      "Получила полную стипендию NUS. Поделюсь стратегией подачи документов и подготовкой к интервью в азиатских вузах.",
    tip: "NUS Global Merit Scholarship — полное покрытие, но конкурс на 1 место из ~50 кандидатов.",
  },
  {
    id: "berlin",
    name: "Тилек Сатыбалдиев",
    university: "TU Berlin",
    city: "Берлин",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=tilek-berlin",
    coordinates: [52.52, 13.4],
    message:
      "Учусь в TU Berlin на программе по возобновляемой энергетике. Объясню, как поступить в Германию с минимальным бюджетом.",
    tip: "В Германии большинство программ бесплатны — нужен блокированный счёт ~11 000 € на год.",
  },
  {
    id: "seoul",
    name: "Бегайым Осмонова",
    university: "Seoul National Univ.",
    city: "Сеул",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=begaiym-seoul",
    coordinates: [37.57, 126.98],
    message:
      "На программе обмена в SNU изучаю медиакоммуникации. Расскажу про корейские гранты и адаптацию к кампусной жизни.",
    tip: "KGSP — полный грант правительства Кореи, подача через посольство или напрямую в вуз.",
  },
  {
    id: "toronto",
    name: "Чолпон Эркинова",
    university: "University of Toronto",
    city: "Торонто",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=cholpon-toronto",
    coordinates: [43.65, -79.38],
    message:
      "В UofT на факультете психологии. Помогу с выбором программ в Канаде и подготовкой к IELTS для поступления.",
    tip: "Study Permit в Канаде открывает право работать 20 ч/нед — отличный способ окупить учёбу.",
  },
];

/** Source hub — every arc on the globe originates here. */
export const BISHKEK = { lat: 42.87, lon: 74.59 } as const;

export function studentLatLon(student: AppStudent) {
  return { lat: student.coordinates[0], lon: student.coordinates[1] };
}

/** Approximate great-circle distance in km (Bishkek → student city). */
export function distanceFromBishkek(student: AppStudent): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const [lat1, lon1] = [BISHKEK.lat, BISHKEK.lon];
  const [lat2, lon2] = student.coordinates;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
}
