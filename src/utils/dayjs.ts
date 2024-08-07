import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.locale('ko')
dayjs.extend(utc)
dayjs.extend(timezone)

export const dayFormat = (appointmentTime: string) => {
  return dayjs(appointmentTime).format('YYYY년 M월 D일 (dd)')
}
