import dayjs from 'dayjs'
import 'dayjs/locale/ko'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.locale('ko')
dayjs.extend(utc)
dayjs.extend(timezone)

export const dayFormat = (appointmentTime: string) => {
  return dayjs(appointmentTime).format('M월 DD일 (dd) A h:mm')
}
