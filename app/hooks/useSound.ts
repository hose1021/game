import { useEffect, useRef } from 'react';

const useSound = (src: string) => {
  const sound = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    sound.current = new Audio(src);
  }, [src]);

  const play = () => {
    sound.current?.play();
  };

  return play;
};

export default useSound;