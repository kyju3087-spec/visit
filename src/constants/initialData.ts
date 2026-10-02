import { RestaurantEntry } from '../types';

export const INITIAL_SAMPLE_RESTAURANTS: RestaurantEntry[] = [
  {
    id: 'rest_01',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    name: '연남토마 본점',
    category: '일식',
    signatureMenu: '명란 바질오일 파스타, 안심가츠',
    rating: 5,
    review: '바질 향이 은은하게 퍼지는 명란 파스타와 겉바속촉 끝판왕 안심가츠의 조화가 예술! 웨이팅이 조금 있었지만 정원이 예뻐서 기다릴 만했습니다.',
    isRecommended: true,
    location: '서울 마포구 연남동',
    likes: 12
  },
  {
    id: 'rest_02',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    name: '담은갈비 & 곤드레밥',
    category: '한식',
    signatureMenu: '수제 양념돼지갈비 정식',
    rating: 5,
    review: '자극적이지 않고 은은한 양념 갈비에 가마솥 곤드레밥까지 완벽한 한 상. 부모님 모시고 가기 딱 좋은 정갈한 한식당입니다.',
    isRecommended: true,
    location: '경기 성남시 분당구',
    likes: 8
  },
  {
    id: 'rest_03',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    name: '오브제 커피 로스터스',
    category: '카페·디저트',
    signatureMenu: '피스타치오 크림 라떼, 쑥 갸또',
    rating: 4,
    review: '직접 로스팅한 원두의 고소함과 묵직한 피스타치오 크림이 어우러져 취향저격. 조용해서 혼자 책 읽거나 작업하기에도 너무 좋아요.',
    isRecommended: true,
    location: '서울 성동구 성수동',
    likes: 15
  },
  {
    id: 'rest_04',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    name: '비스트로 루나 (Bistro Luna)',
    category: '양식',
    signatureMenu: '트러플 뇨끼 & 채끝 스테이크',
    rating: 5,
    review: '쫀득쫀득한 감자 뇨끼에 진한 생트러플 향이 입안 가득 감돕니다. 기념일 데이트 코스로 손색없는 아늑하고 세련된 와인 다이닝.',
    isRecommended: true,
    location: '서울 용산구 한남동',
    likes: 19
  },
  {
    id: 'rest_05',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    name: '진진가 (珍珍家)',
    category: '중식',
    signatureMenu: '멘보샤, 마파두부 덮밥',
    rating: 4,
    review: '두툼한 통새우살이 꽉 차 있는 바삭한 멘보샤가 인상적. 화자오 향이 톡 쏘는 정통 사천식 마파두부도 밥도둑입니다.',
    isRecommended: true,
    location: '서울 마포구 서교동',
    likes: 7
  },
  {
    id: 'rest_06',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    name: '골목 떡볶이 & 수제튀김',
    category: '분식',
    signatureMenu: '국물 떡볶이, 왕새우 모둠튀김',
    rating: 3,
    review: '학교 앞 추억의 달콤매콤한 떡볶이 맛. 튀김은 바삭하지만 저녁 늦게 가면 떡이 조금 불어있을 수 있으니 참고하세요.',
    isRecommended: false,
    location: '서울 송파구 문정동',
    likes: 4
  }
];

export const CATEGORIES: { label: string; value: import('../types').RestaurantCategory | '전체'; emoji: string }[] = [
  { label: '전체', value: '전체', emoji: '🍽️' },
  { label: '한식', value: '한식', emoji: '🍚' },
  { label: '일식', value: '일식', emoji: '🍣' },
  { label: '양식', value: '양식', emoji: '🍝' },
  { label: '중식', value: '중식', emoji: '🥟' },
  { label: '카페·디저트', value: '카페·디저트', emoji: '☕' },
  { label: '분식', value: '분식', emoji: ' 분식' },
  { label: '기타', value: '기타', emoji: '🍴' },
];
