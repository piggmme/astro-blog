import { useRef, useState } from 'react'
import styles from './Swiper.module.scss'

const ITEM_WIDTH = 200
const GAP = 16

function SwiperMain ({ children }: { children: React.ReactNode }) {
  const [nextDisabled, setNextDisabled] = useState(false)
  const [prevDisabled, setPrevDisabled] = useState(true)

  const swiperRef = useRef<HTMLUListElement>(null)

  return (
    <div className={styles.Container}>
      <ul ref={swiperRef} className={styles.Swiper}>
        {children}
      </ul>

      <SwiperControls
        prev={() => {
          if (swiperRef.current) {
            swiperRef.current.scrollBy({
              left: -(ITEM_WIDTH + GAP),
              behavior: 'smooth',
            })
            setNextDisabled(false)
            if (swiperRef.current.scrollLeft === 0) {
              setPrevDisabled(true)
            }
          }
        }}
        prevDisabled={prevDisabled}
        next={() => {
          console.log('next')
          if (swiperRef.current) {
            swiperRef.current.scrollBy({
              left: (ITEM_WIDTH + GAP),
              behavior: 'smooth',
            })
            setPrevDisabled(false)
            if (
              swiperRef.current.scrollLeft + swiperRef.current.offsetWidth
              >= swiperRef.current.scrollWidth
            ) {
              setNextDisabled(true)
            }
          }
        }}
        nextDisabled={nextDisabled}
      />
    </div>
  )
}

function SwiperItem ({ children }: { children: React.ReactNode }) {
  return <li className={styles.Item} style={{ width: `${ITEM_WIDTH}px` }}>{children}</li>
}

function SwiperControls ({
  prev,
  prevDisabled,
  next,
  nextDisabled,
}: {
  prev: () => void
  prevDisabled: boolean
  next: () => void
  nextDisabled: boolean
}) {
  return (
    <div className={styles.Controls}>
      <button disabled={prevDisabled} onClick={prev}>Prev</button>
      <button disabled={nextDisabled} onClick={next}>Next</button>
    </div>
  )
}

const Swiper = Object.assign(SwiperMain, { Item: SwiperItem })

export default Swiper
