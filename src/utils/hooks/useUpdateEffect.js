import { useRef, useEffect } from 'react';

const useUpdateEffect = (callback, dependencies) => {
  const firstRender = useRef(true);

  useEffect(() => {
    if (!firstRender.current) {
      return callback();
    }
    firstRender.current = false;
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps
};

export default useUpdateEffect;
