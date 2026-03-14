import React, { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import cardCourses from '../assets/card-courses.png';
import cardStudy from '../assets/card-study.png';
import cardExam from '../assets/card-exam.png';
import cardPlacements from '../assets/card-placements.png';

const featuresData = [
  {
    key: 'feature1',
    title: 'Courses',
    description: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.',
    link: '/academics',
    buttonText: 'Explore More >>',
    buttonClass: 'bg-gradient-to-r from-[#FF7582] to-[#FC4F5F] shadow-pink-200',
    borderColor: 'border-[#FF7582]',
    bgColor: 'bg-[#FFEFF0]', // Light Pink
    image: cardCourses,
  },
  {
    key: 'feature2',
    title: 'Study Materials',
    description: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.',
    link: '/student-corner',
    buttonText: 'Explore More >>',
    buttonClass: 'bg-gradient-to-r from-[#FFB073] to-[#FF8C42] shadow-orange-200',
    borderColor: 'border-[#FFB073]',
    bgColor: 'bg-[#FFF5EB]', // Light Peach
    image: cardStudy,
  },
  {
    key: 'feature3',
    title: 'Exam Notices',
    description: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.',
    link: '/examinations',
    buttonText: 'Explore More >>',
    buttonClass: 'bg-gradient-to-r from-[#A78BFA] to-[#7C3AED] shadow-purple-200',
    borderColor: 'border-[#A78BFA]',
    bgColor: 'bg-[#F5F3FF]', // Light Purple
    image: cardExam,
  },
  {
    key: 'feature4',
    title: 'Placements',
    description: 'Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry.',
    link: '/placements',
    buttonText: 'Explore More >>',
    buttonClass: 'bg-gradient-to-r from-[#34D399] to-[#059669] shadow-green-200',
    borderColor: 'border-[#34D399]',
    bgColor: 'bg-[#ECFDF5]', // Light Green
    image: cardPlacements,
  },
];

export default function FeatureCards() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [features, setFeatures] = useState(featuresData);
  const carouselRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'page_content', 'page_home'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFeatures(featuresData.map(f => ({
          ...f,
          title: data[`${f.key}_title`] || f.title,
          description: data[`${f.key}_desc`] || f.description,
          link: data[`${f.key}_link`] || f.link
        })));
      }
    });

    return () => unsubscribe();
  }, []);

  const handleScroll = () => {
    if (carouselRef.current) {
      const scrollLeft = carouselRef.current.scrollLeft;
      const firstCard = carouselRef.current.children[0] as HTMLElement;
      const cardWidth = firstCard.offsetWidth;
      const gap = 16;
      const totalCardSpace = cardWidth + gap;
      const index = Math.round(scrollLeft / totalCardSpace);
      setActiveIndex(index);
    }
  };

  const scrollToIndex = (index: number) => {
    if (carouselRef.current) {
      const firstCard = carouselRef.current.children[0] as HTMLElement;
      const cardWidth = firstCard.offsetWidth;
      const gap = 16;
      const totalCardSpace = cardWidth + gap;

      carouselRef.current.scrollTo({
        left: index * totalCardSpace,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section className="py-8 lg:py-20 px-0 font-sans bg-[#FDFDFF]">
      <div className="container mx-auto px-0 md:px-4">
        <div
          ref={carouselRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto gap-12 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 snap-x snap-mandatory no-scrollbar hide-scrollbar py-4 md:pb-0 px-4 md:px-0"
        >
          {features.map((feature, index) => (
            <div
              key={index}
              className={`${feature.bgColor} ${feature.borderColor} border rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col items-center text-center relative overflow-hidden group h-full w-[calc(100vw-2rem)] md:w-full max-w-sm shrink-0 snap-center mx-auto`}
            >
              <div className="w-full flex justify-center mb-6 mt-4">
                <img
                  src={feature.image}
                  alt={feature.title}
                  className="h-40 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <h3 className="text-2xl font-extrabold text-[#0B0B3B] mb-3">
                {feature.title}
              </h3>

              <p className="text-gray-600 text-xs mb-8 px-2 leading-relaxed opacity-90 font-medium">
                {feature.description}
              </p>

              <div className="mt-auto w-full pb-4">
                <Link
                  to={feature.link}
                  className={`${feature.buttonClass} border-[#FFD700] border text-white font-bold py-3 px-6 rounded-full text-xs shadow-lg transition-transform hover:scale-105 w-full max-w-[160px] inline-block`}
                >
                  {feature.buttonText}
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Dots (Mobile Only) */}
        <div className="flex justify-center gap-2 mt-4 md:hidden">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollToIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${activeIndex === index ? 'bg-[#0B0B3B] w-6' : 'bg-gray-300'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
}
