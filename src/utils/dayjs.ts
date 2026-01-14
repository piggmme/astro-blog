import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.locale('ko')
dayjs.extend(utc)
dayjs.extend(timezone)

export const dayFormat = (date: string | Date, locale: string = 'ko') => {
  return dayjs(date).locale(locale).format(locale === 'ko' ? 'YYYY년 M월 D일' : 'MMMM D, YYYY')
}
