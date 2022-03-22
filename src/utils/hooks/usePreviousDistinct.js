import { useRef } from 'react';
import useFirstMountState from './useFirstMountState';

const shouldUpdateValue = (value) => {
  if (value == null) return false;

  if (typeof value === 'object') {
    if (Array.isArray(value)) return !!value.length;
    return !!Object.keys(value).length;
  }

  return !!value;
};

const usePreviousDistinct = (value, compare) => {
  const currRef = useRef(value);
  const distinctValueRef = useRef();
  const isFirstMount = useFirstMountState();
  const diff = compare(currRef.current, value);

  if (!isFirstMount && shouldUpdateValue(diff)) {
    distinctValueRef.current = diff;
    currRef.current = value;
  }

  return distinctValueRef.current;
};

export default usePreviousDistinct;
