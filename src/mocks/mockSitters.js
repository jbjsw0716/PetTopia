// 40건 — 이 목록도 펫시터 찾기 무한 스크롤 화면이라 한 묶음 12개 기준으로
// 세 번째 묶음이 나오려면 25건 이상이 필요하다. 40건은 12 + 12 + 12 + 4 로 네 묶음이다.
//
// 서비스 대상 동물은 mockServices 를 따른다 — 산책·데이케어는 개, 방문 돌봄·장기 돌봄은 개·고양이.
// 그래서 고양이만 돌보는 펫시터는 방문 돌봄·장기 돌봄만 제공하고, 산책·데이케어만 제공하는 펫시터는
// 개만 받는다 — 받는 동물마다 그 동물이 쓸 수 있는 서비스가 하나는 있어야 한다(mockCheck 가 검사한다).
// 경력 문구도 돌봄 동물과 맞춘다.
//
// PS025(홍하나)는 일부러 후기를 두지 않아 '평점 없음' 표시를 확인할 수 있게 남겨 두었다 (mockReviews.js 참조).
//
// 평점은 여기 두지 않는다. 그 펫시터 후기의 평균을 그때그때 계산한다.
//
// 사진(imageUrl)은 public/images/sitters/ 의 480px JPG 다. 여성 20장·남성 20장을 무작위로 섞어
// 한 장씩 붙였다. 한 명씩 바꿔도 된다.

const mockSitters = [
  {
    id: 'PS001',
    name: '이돌봄',
    regionId: 'GANGNAM',
    petTypes: ['DOG', 'CAT'],
    career: '소형견과 고양이를 5년간 돌봤습니다.',
    imageUrl: '/images/sitters/male_10.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '10:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS002',
    name: '박다정',
    regionId: 'SEOCHO',
    petTypes: ['DOG', 'CAT'],
    career: '고양이를 2년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_08.jpg',
    services: [
      { serviceId: 'VISIT', price: 32000 }
    ],
    availableHours: [
      { day: 'WED', startTime: '10:00', endTime: '19:00' },
      { day: 'THU', startTime: '10:00', endTime: '19:00' },
      { day: 'FRI', startTime: '10:00', endTime: '19:00' }
    ]
  },
  {
    id: 'PS003',
    name: '최성실',
    regionId: 'SONGPA',
    petTypes: ['DOG'],
    career: '대형견과 소형견을 3년간 함께 돌봤습니다.',
    imageUrl: '/images/sitters/female_06.jpg',
    services: [
      { serviceId: 'DAYCARE', price: 50000 }
    ],
    availableHours: [
      { day: 'SAT', startTime: '09:00', endTime: '18:00' },
      { day: 'SUN', startTime: '09:00', endTime: '18:00' }
    ]
  },
  {
    id: 'PS004',
    name: '김따뜻',
    regionId: 'MAPO',
    petTypes: ['DOG'],
    career: '다견 가정 방문 경험이 4년 있습니다.',
    imageUrl: '/images/sitters/female_12.jpg',
    services: [
      { serviceId: 'WALK', price: 14000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '13:00', endTime: '21:00' },
      { day: 'WED', startTime: '13:00', endTime: '21:00' },
      { day: 'FRI', startTime: '13:00', endTime: '21:00' }
    ]
  },
  {
    id: 'PS005',
    name: '정든든',
    regionId: 'YONGSAN',
    petTypes: ['CAT'],
    career: '유기동물 보호소에서 5년간 봉사했습니다.',
    imageUrl: '/images/sitters/male_05.jpg',
    services: [
      { serviceId: 'BOARDING', price: 75000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '08:00', endTime: '16:00' },
      { day: 'THU', startTime: '08:00', endTime: '16:00' },
      { day: 'SAT', startTime: '08:00', endTime: '12:00' },
      { day: 'SUN', startTime: '08:00', endTime: '12:00' }
    ]
  },
  {
    id: 'PS006',
    name: '한포근',
    regionId: 'GWANGJIN',
    petTypes: ['DOG'],
    career: '강아지 유치원에서 6년간 근무했습니다.',
    imageUrl: '/images/sitters/female_13.jpg',
    services: [
      { serviceId: 'WALK', price: 16000 },
      { serviceId: 'DAYCARE', price: 53000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '20:00' },
      { day: 'TUE', startTime: '09:00', endTime: '20:00' },
      { day: 'WED', startTime: '09:00', endTime: '20:00' },
      { day: 'THU', startTime: '09:00', endTime: '20:00' },
      { day: 'FRI', startTime: '09:00', endTime: '20:00' }
    ]
  },
  {
    id: 'PS007',
    name: '윤세심',
    regionId: 'GANGSEO',
    petTypes: ['CAT'],
    career: '반려동물 돌봄 시설에서 7년간 일했습니다.',
    imageUrl: '/images/sitters/male_17.jpg',
    services: [
      { serviceId: 'VISIT', price: 28000 },
      { serviceId: 'BOARDING', price: 70000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '10:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS008',
    name: '조믿음',
    regionId: 'NOWON',
    petTypes: ['DOG', 'CAT'],
    career: '소형견을 8년간 돌봤습니다.',
    imageUrl: '/images/sitters/male_07.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 },
      { serviceId: 'DAYCARE', price: 52000 }
    ],
    availableHours: [
      { day: 'WED', startTime: '10:00', endTime: '19:00' },
      { day: 'THU', startTime: '10:00', endTime: '19:00' },
      { day: 'FRI', startTime: '10:00', endTime: '19:00' }
    ]
  },
  {
    id: 'PS009',
    name: '강마음',
    regionId: 'GANGNAM',
    petTypes: ['DOG', 'CAT'],
    career: '고양이를 1년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_10.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'SAT', startTime: '09:00', endTime: '17:00' },
      { day: 'SUN', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    id: 'PS010',
    name: '오다감',
    regionId: 'SEOCHO',
    petTypes: ['DOG', 'CAT'],
    career: '대형견과 소형견을 2년간 함께 돌봤습니다.',
    imageUrl: '/images/sitters/female_19.jpg',
    services: [
      { serviceId: 'VISIT', price: 32000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '13:00', endTime: '21:00' },
      { day: 'WED', startTime: '13:00', endTime: '21:00' },
      { day: 'FRI', startTime: '13:00', endTime: '21:00' }
    ]
  },
  {
    id: 'PS011',
    name: '서정성',
    regionId: 'SONGPA',
    petTypes: ['DOG'],
    career: '강아지 데이케어 경험이 3년 있습니다.',
    imageUrl: '/images/sitters/male_16.jpg',
    services: [
      { serviceId: 'DAYCARE', price: 50000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '08:00', endTime: '17:00' },
      { day: 'THU', startTime: '08:00', endTime: '17:00' },
      { day: 'SAT', startTime: '08:00', endTime: '12:00' },
      { day: 'SUN', startTime: '08:00', endTime: '12:00' }
    ]
  },
  {
    id: 'PS012',
    name: '배살핌',
    regionId: 'MAPO',
    petTypes: ['DOG'],
    career: '유기동물 보호소에서 4년간 봉사했습니다.',
    imageUrl: '/images/sitters/male_01.jpg',
    services: [
      { serviceId: 'WALK', price: 14000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '20:00' },
      { day: 'TUE', startTime: '09:00', endTime: '20:00' },
      { day: 'WED', startTime: '09:00', endTime: '20:00' },
      { day: 'THU', startTime: '09:00', endTime: '20:00' },
      { day: 'FRI', startTime: '09:00', endTime: '20:00' }
    ]
  },
  {
    id: 'PS013',
    name: '노곰신',
    regionId: 'YONGSAN',
    petTypes: ['CAT'],
    career: '고양이 카페에서 5년간 근무했습니다.',
    imageUrl: '/images/sitters/female_16.jpg',
    services: [
      { serviceId: 'BOARDING', price: 75000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '10:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS014',
    name: '임예쁨',
    regionId: 'GWANGJIN',
    petTypes: ['DOG'],
    career: '반려동물 돌봄 시설에서 6년간 일했습니다.',
    imageUrl: '/images/sitters/female_11.jpg',
    services: [
      { serviceId: 'WALK', price: 16000 },
      { serviceId: 'DAYCARE', price: 53000 }
    ],
    availableHours: [
      { day: 'WED', startTime: '10:00', endTime: '19:00' },
      { day: 'THU', startTime: '10:00', endTime: '19:00' },
      { day: 'FRI', startTime: '10:00', endTime: '19:00' }
    ]
  },
  {
    id: 'PS015',
    name: '백듬직',
    regionId: 'GANGSEO',
    petTypes: ['CAT'],
    career: '고양이를 7년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_09.jpg',
    services: [
      { serviceId: 'VISIT', price: 28000 },
      { serviceId: 'BOARDING', price: 70000 }
    ],
    availableHours: [
      { day: 'SAT', startTime: '09:00', endTime: '17:00' },
      { day: 'SUN', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    id: 'PS016',
    name: '남소중',
    regionId: 'NOWON',
    petTypes: ['DOG'],
    career: '중대형견을 8년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_04.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 },
      { serviceId: 'DAYCARE', price: 52000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '12:00', endTime: '21:00' },
      { day: 'WED', startTime: '12:00', endTime: '21:00' },
      { day: 'FRI', startTime: '12:00', endTime: '21:00' }
    ]
  },
  {
    id: 'PS017',
    name: '구정성',
    regionId: 'GANGNAM',
    petTypes: ['DOG', 'CAT'],
    career: '대형견과 소형견을 1년간 함께 돌봤습니다.',
    imageUrl: '/images/sitters/male_06.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '08:00', endTime: '16:00' },
      { day: 'THU', startTime: '08:00', endTime: '16:00' },
      { day: 'SAT', startTime: '08:00', endTime: '12:00' },
      { day: 'SUN', startTime: '08:00', endTime: '12:00' }
    ]
  },
  {
    id: 'PS018',
    name: '안온화',
    regionId: 'SEOCHO',
    petTypes: ['DOG', 'CAT'],
    career: '다묘 가정 방문 경험이 2년 있습니다.',
    imageUrl: '/images/sitters/female_18.jpg',
    services: [
      { serviceId: 'VISIT', price: 32000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '20:00' },
      { day: 'TUE', startTime: '09:00', endTime: '20:00' },
      { day: 'WED', startTime: '09:00', endTime: '20:00' },
      { day: 'THU', startTime: '09:00', endTime: '20:00' },
      { day: 'FRI', startTime: '09:00', endTime: '20:00' }
    ]
  },
  {
    id: 'PS019',
    name: '진살뜰',
    regionId: 'SONGPA',
    petTypes: ['DOG'],
    career: '유기동물 보호소에서 3년간 봉사했습니다.',
    imageUrl: '/images/sitters/male_12.jpg',
    services: [
      { serviceId: 'DAYCARE', price: 50000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '10:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS020',
    name: '표다솜',
    regionId: 'MAPO',
    petTypes: ['DOG'],
    career: '강아지 유치원에서 4년간 근무했습니다.',
    imageUrl: '/images/sitters/male_19.jpg',
    services: [
      { serviceId: 'WALK', price: 14000 }
    ],
    availableHours: [
      { day: 'WED', startTime: '10:00', endTime: '19:00' },
      { day: 'THU', startTime: '10:00', endTime: '19:00' },
      { day: 'FRI', startTime: '10:00', endTime: '19:00' }
    ]
  },
  {
    id: 'PS021',
    name: '마음결',
    regionId: 'YONGSAN',
    petTypes: ['CAT'],
    career: '반려동물 돌봄 시설에서 5년간 일했습니다.',
    imageUrl: '/images/sitters/male_08.jpg',
    services: [
      { serviceId: 'BOARDING', price: 75000 }
    ],
    availableHours: [
      { day: 'SAT', startTime: '09:00', endTime: '17:00' },
      { day: 'SUN', startTime: '09:00', endTime: '17:00' }
    ]
  },
  {
    id: 'PS022',
    name: '하늘길',
    regionId: 'GWANGJIN',
    petTypes: ['DOG'],
    career: '소형견을 6년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_17.jpg',
    services: [
      { serviceId: 'WALK', price: 16000 },
      { serviceId: 'DAYCARE', price: 53000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '12:00', endTime: '21:00' },
      { day: 'WED', startTime: '12:00', endTime: '21:00' },
      { day: 'FRI', startTime: '12:00', endTime: '21:00' }
    ]
  },
  {
    id: 'PS023',
    name: '류소망',
    regionId: 'GANGSEO',
    petTypes: ['CAT'],
    career: '고양이를 7년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_02.jpg',
    services: [
      { serviceId: 'VISIT', price: 28000 },
      { serviceId: 'BOARDING', price: 70000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '08:00', endTime: '16:00' },
      { day: 'THU', startTime: '08:00', endTime: '16:00' },
      { day: 'SAT', startTime: '08:00', endTime: '12:00' },
      { day: 'SUN', startTime: '08:00', endTime: '12:00' }
    ]
  },
  {
    id: 'PS024',
    name: '전별빛',
    regionId: 'NOWON',
    petTypes: ['DOG', 'CAT'],
    career: '대형견과 소형견을 8년간 함께 돌봤습니다.',
    imageUrl: '/images/sitters/male_03.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 },
      { serviceId: 'DAYCARE', price: 52000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '20:00' },
      { day: 'TUE', startTime: '09:00', endTime: '20:00' },
      { day: 'WED', startTime: '09:00', endTime: '20:00' },
      { day: 'THU', startTime: '09:00', endTime: '20:00' },
      { day: 'FRI', startTime: '09:00', endTime: '20:00' }
    ]
  },
  {
    id: 'PS025',
    name: '홍하나',
    regionId: 'GANGNAM',
    petTypes: ['DOG'],
    career: '다견 가정 방문 경험이 1년 있습니다.',
    imageUrl: '/images/sitters/female_14.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '10:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS026',
    name: '남다온',
    regionId: 'SEOCHO',
    petTypes: ['DOG'],
    career: '중대형견 산책을 4년간 전담했습니다.',
    imageUrl: '/images/sitters/male_09.jpg',
    services: [
      { serviceId: 'WALK', price: 17000 },
      { serviceId: 'DAYCARE', price: 55000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '07:00', endTime: '19:00' },
      { day: 'TUE', startTime: '07:00', endTime: '19:00' },
      { day: 'WED', startTime: '07:00', endTime: '19:00' },
      { day: 'THU', startTime: '07:00', endTime: '19:00' },
      { day: 'FRI', startTime: '07:00', endTime: '19:00' },
      { day: 'SAT', startTime: '08:00', endTime: '14:00' }
    ]
  },
  {
    id: 'PS027',
    name: '문서연',
    regionId: 'MAPO',
    petTypes: ['DOG', 'CAT'],
    career: '강아지와 고양이를 함께 키우며 4년간 돌봄을 해 왔습니다.',
    imageUrl: '/images/sitters/female_15.jpg',
    services: [
      { serviceId: 'VISIT', price: 31000 },
      { serviceId: 'BOARDING', price: 72000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '10:00', endTime: '18:00' },
      { day: 'TUE', startTime: '10:00', endTime: '18:00' },
      { day: 'WED', startTime: '10:00', endTime: '18:00' },
      { day: 'THU', startTime: '10:00', endTime: '18:00' },
      { day: 'FRI', startTime: '10:00', endTime: '18:00' },
      { day: 'SUN', startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    id: 'PS028',
    name: '곽포롱',
    regionId: 'GANGSEO',
    petTypes: ['CAT'],
    career: '고양이 방문 돌봄만 3년간 해 왔습니다.',
    imageUrl: '/images/sitters/female_20.jpg',
    services: [
      { serviceId: 'VISIT', price: 29000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '09:00', endTime: '17:00' },
      { day: 'THU', startTime: '09:00', endTime: '17:00' },
      { day: 'SAT', startTime: '09:00', endTime: '15:00' },
      { day: 'SUN', startTime: '09:00', endTime: '15:00' }
    ]
  },
  {
    id: 'PS029',
    name: '신하람',
    regionId: 'SONGPA',
    petTypes: ['DOG'],
    career: '소형견 데이케어를 5년간 운영했습니다.',
    imageUrl: '/images/sitters/male_02.jpg',
    services: [
      { serviceId: 'WALK', price: 15500 },
      { serviceId: 'DAYCARE', price: 51000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '08:00', endTime: '18:00' },
      { day: 'TUE', startTime: '08:00', endTime: '18:00' },
      { day: 'WED', startTime: '08:00', endTime: '18:00' },
      { day: 'THU', startTime: '08:00', endTime: '18:00' },
      { day: 'FRI', startTime: '08:00', endTime: '18:00' }
    ]
  },
  {
    id: 'PS030',
    name: '도예린',
    regionId: 'GANGNAM',
    petTypes: ['CAT'],
    career: '투약이 필요한 고양이를 돌본 경험이 6년 있습니다.',
    imageUrl: '/images/sitters/male_20.jpg',
    services: [
      { serviceId: 'VISIT', price: 34000 },
      { serviceId: 'BOARDING', price: 78000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '10:00', endTime: '19:00' },
      { day: 'WED', startTime: '10:00', endTime: '19:00' },
      { day: 'FRI', startTime: '10:00', endTime: '19:00' },
      { day: 'SAT', startTime: '10:00', endTime: '16:00' }
    ]
  },
  {
    id: 'PS031',
    name: '방은우',
    regionId: 'NOWON',
    petTypes: ['DOG', 'CAT'],
    career: '대형견 산책과 고양이 방문 돌봄을 함께 3년간 했습니다.',
    imageUrl: '/images/sitters/male_11.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'SAT', startTime: '07:00', endTime: '19:00' },
      { day: 'SUN', startTime: '07:00', endTime: '19:00' }
    ]
  },
  {
    id: 'PS032',
    name: '엄지안',
    regionId: 'GWANGJIN',
    petTypes: ['DOG'],
    career: '노령견 돌봄을 7년간 전담해 왔습니다.',
    imageUrl: '/images/sitters/male_15.jpg',
    services: [
      { serviceId: 'WALK', price: 16500 },
      { serviceId: 'VISIT', price: 33000 },
      { serviceId: 'DAYCARE', price: 54000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'WED', startTime: '09:00', endTime: '18:00' },
      { day: 'THU', startTime: '09:00', endTime: '18:00' },
      { day: 'FRI', startTime: '09:00', endTime: '18:00' }
    ]
  },
  {
    id: 'PS033',
    name: '피서율',
    regionId: 'YONGSAN',
    petTypes: ['CAT'],
    career: '유기묘 임시 보호를 5년간 했습니다.',
    imageUrl: '/images/sitters/female_03.jpg',
    services: [
      { serviceId: 'VISIT', price: 27000 },
      { serviceId: 'BOARDING', price: 73000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'WED', startTime: '09:00', endTime: '18:00' },
      { day: 'THU', startTime: '09:00', endTime: '18:00' },
      { day: 'FRI', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '09:00', endTime: '18:00' },
      { day: 'SUN', startTime: '09:00', endTime: '18:00' }
    ]
  },
  {
    id: 'PS034',
    name: '태하준',
    regionId: 'MAPO',
    petTypes: ['DOG'],
    career: '이른 아침 산책을 3년간 전문으로 해 왔습니다.',
    imageUrl: '/images/sitters/male_14.jpg',
    services: [
      { serviceId: 'WALK', price: 13500 }
    ],
    availableHours: [
      { day: 'MON', startTime: '06:00', endTime: '10:00' },
      { day: 'TUE', startTime: '06:00', endTime: '10:00' },
      { day: 'WED', startTime: '06:00', endTime: '10:00' },
      { day: 'THU', startTime: '06:00', endTime: '10:00' },
      { day: 'FRI', startTime: '06:00', endTime: '10:00' }
    ]
  },
  {
    id: 'PS035',
    name: '선유나',
    regionId: 'SEOCHO',
    petTypes: ['DOG', 'CAT'],
    career: '반려동물 행동 교육을 공부하며 2년간 돌봤습니다.',
    imageUrl: '/images/sitters/female_05.jpg',
    services: [
      { serviceId: 'WALK', price: 15000 },
      { serviceId: 'VISIT', price: 30000 },
      { serviceId: 'DAYCARE', price: 50000 },
      { serviceId: 'BOARDING', price: 68000 }
    ],
    availableHours: [
      { day: 'TUE', startTime: '10:00', endTime: '20:00' },
      { day: 'WED', startTime: '10:00', endTime: '20:00' },
      { day: 'THU', startTime: '10:00', endTime: '20:00' },
      { day: 'FRI', startTime: '10:00', endTime: '20:00' },
      { day: 'SAT', startTime: '10:00', endTime: '20:00' }
    ]
  },
  {
    id: 'PS036',
    name: '연라온',
    regionId: 'GANGSEO',
    petTypes: ['DOG'],
    career: '소형견을 한 번에 한 마리만 맡아 4년간 돌봤습니다.',
    imageUrl: '/images/sitters/male_18.jpg',
    services: [
      { serviceId: 'DAYCARE', price: 58000 },
      { serviceId: 'BOARDING', price: 72000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'WED', startTime: '09:00', endTime: '18:00' },
      { day: 'THU', startTime: '09:00', endTime: '18:00' },
      { day: 'FRI', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '09:00', endTime: '13:00' }
    ]
  },
  {
    id: 'PS037',
    name: '우채원',
    regionId: 'SONGPA',
    petTypes: ['CAT'],
    career: '다묘 가정 방문 경험이 4년 있습니다.',
    imageUrl: '/images/sitters/female_01.jpg',
    services: [
      { serviceId: 'VISIT', price: 30000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '13:00', endTime: '21:00' },
      { day: 'TUE', startTime: '13:00', endTime: '21:00' },
      { day: 'WED', startTime: '13:00', endTime: '21:00' },
      { day: 'THU', startTime: '13:00', endTime: '21:00' },
      { day: 'FRI', startTime: '13:00', endTime: '21:00' }
    ]
  },
  {
    id: 'PS038',
    name: '국시온',
    regionId: 'GANGNAM',
    petTypes: ['DOG', 'CAT'],
    career: '반려동물 관련 학과를 졸업하고 1년간 돌봤습니다.',
    imageUrl: '/images/sitters/male_13.jpg',
    services: [
      { serviceId: 'WALK', price: 12000 },
      { serviceId: 'VISIT', price: 24000 }
    ],
    availableHours: [
      { day: 'WED', startTime: '14:00', endTime: '22:00' },
      { day: 'THU', startTime: '14:00', endTime: '22:00' }
    ]
  },
  {
    id: 'PS039',
    name: '봉하은',
    regionId: 'NOWON',
    petTypes: ['CAT'],
    career: '고양이 카페에서 3년간 근무했습니다.',
    imageUrl: '/images/sitters/female_07.jpg',
    services: [
      { serviceId: 'VISIT', price: 28000 },
      { serviceId: 'BOARDING', price: 69000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'WED', startTime: '09:00', endTime: '18:00' },
      { day: 'THU', startTime: '09:00', endTime: '18:00' },
      { day: 'FRI', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '09:00', endTime: '18:00' }
    ]
  },
  {
    id: 'PS040',
    name: '석도담',
    regionId: 'YONGSAN',
    petTypes: ['DOG'],
    career: '반려견 훈련소에서 2년간 보조 훈련사로 일했습니다.',
    imageUrl: '/images/sitters/male_04.jpg',
    services: [
      { serviceId: 'WALK', price: 14500 },
      { serviceId: 'DAYCARE', price: 49000 }
    ],
    availableHours: [
      { day: 'MON', startTime: '09:00', endTime: '18:00' },
      { day: 'TUE', startTime: '09:00', endTime: '18:00' },
      { day: 'WED', startTime: '09:00', endTime: '18:00' },
      { day: 'THU', startTime: '09:00', endTime: '18:00' },
      { day: 'FRI', startTime: '09:00', endTime: '18:00' },
      { day: 'SAT', startTime: '09:00', endTime: '18:00' }
    ]
  }
];

export { mockSitters };
