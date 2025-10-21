// 台灣縣市列表
const TAIWAN_CITIES = [
  '台北市', '新北市', '桃園市', '台中市', '台南市', '高雄市',
  '基隆市', '新竹市', '嘉義市',
  '新竹縣', '苗栗縣', '彰化縣', '南投縣', '雲林縣', '嘉義縣',
  '屏東縣', '宜蘭縣', '花蓮縣', '台東縣', '澎湖縣', '金門縣', '連江縣'
];

// 性別選項
const GENDERS = {
  MALE: 'male',
  FEMALE: 'female',
  OTHER: 'other'
};

const GENDER_LABELS = {
  male: '男',
  female: '女',
  other: '其他'
};

// 漂亮度等級
const BEAUTY_LEVELS = {
  SUPER_BEAUTIFUL: 'super_beautiful',
  NORMAL_BEAUTIFUL: 'normal_beautiful',
  NOT_BEAUTIFUL: 'not_beautiful'
};

const BEAUTY_LEVEL_LABELS = {
  super_beautiful: '超級漂亮',
  normal_beautiful: '普通漂亮',
  not_beautiful: '漂亮再見'
};

module.exports = {
  TAIWAN_CITIES,
  GENDERS,
  GENDER_LABELS,
  BEAUTY_LEVELS,
  BEAUTY_LEVEL_LABELS
};
