import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/scrollbar'

import './Swiper.css'

import React from 'react'
import { useNavigate, useRouteLoaderData } from 'react-router-dom'
import { A11y, Navigation, Pagination, Scrollbar } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'

import classes from './PieceCarousel.module.css'

const PieceCarousel = ({
  pieceUrl,
  tweak,
  background,
  content,
  images,
  youtubeUrl,
}) => {
  const token = useRouteLoaderData('root')
  const navigate = useNavigate()
  const youtubeVideoId = youtubeUrl ? extractYouTubeVideoId(youtubeUrl) : ''

  const handleSlideClick = () => {
    if (pieceUrl && !tweak) {
      if (!token) {
        window.open(pieceUrl, '_blank')
      } else {
        navigate(pieceUrl, {
          state: { background: background },
        })
      }
    }

    if (tweak) {
      navigate(pieceUrl, {
        state: { background: background },
      })
    }
  }

  return (
    <div className={classes['carousel-container']}>
      <Swiper
        modules={[Navigation, Pagination, Scrollbar, A11y]}
        spaceBetween={0}
        slidesPerView={1}
        pagination={{ clickable: true }}
        navigation
      >
        {images.map((image, index) => (
          <SwiperSlide key={index}>
            <div
              className={`${classes['image-container']} ${
                pieceUrl ? classes.pointer : ''
              }`}
              onClick={() => handleSlideClick()}
            >
              <img className={classes.image} src={image} alt={`${index}`} />
            </div>
          </SwiperSlide>
        ))}
        {content && (
          <SwiperSlide onClick={() => handleSlideClick()}>
            <div
              className={`${classes['content-container']} ${
                pieceUrl ? classes.pointer : ''
              }`}
            >
              <div
                className={classes.content}
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>
          </SwiperSlide>
        )}
        {youtubeUrl && (
          <SwiperSlide>
            <div className={classes['youtube-container']}>
              <iframe
                className={classes['youtube-frame']}
                title="YouTube Video"
                width="100%"
                height="100%"
                src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                allowFullScreen
              ></iframe>
            </div>
          </SwiperSlide>
        )}
      </Swiper>
    </div>
  )
}

const extractYouTubeVideoId = url => {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  )
  return match ? match[1] : ''
}

export default PieceCarousel
