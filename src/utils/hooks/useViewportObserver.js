import { useState, useEffect, useCallback, useRef } from 'react';
import useFirstMountState from './useFirstMountState';

/**
 * The Intersection Observer API allows you to configure a callback
 * that is called when either of these circumstances occur:
 * - A target element intersects either the device's viewport or a specified element.
 *   That specified element is called the root element or root for the purposes of the Intersection Observer API.
 * - The first time the observer is initially asked to watch a target element.
 *
 * Source: https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API
 *
 * In useViewportObserver, elements can be observed in two ways:
 *  - passing an array of observable elements as the 'elements' argument to the hook
 *
 *    i.e. useViewportObserver([... HTML Elements], { ...options })
 *
 *    Note: if using mutable ref objects, be sure to pass ref.current('s) into the observable elements array.
 *          The Intersection Observer will automatically update once the elements array contains the DOM nodes
 *          from the ref objects.
 *
 *          i.e. useViewportObserver([ref.current], { ...options })
 *
 *  - setting the 'elements' argument to null in the hook call and calling the 'observe'
 *    function with an array of observable elements
 *
 *    i.e. useViewportObserver(null, { ...options })
 *         observe([... HTML Elements])
 *
 * @typedef ObserverOptions
 * @property {number || number[]} [threshold=0] Percentage(s) of the viewport's visibility at which the entries should be updated
 * @property {boolean} [freezeOnEntry=false] When true, the Intersection Observer will stop watching target elements
 *
 * @param {HTMLElement[]} [element] observable elements array
 * @param {ObserverOptions} options
 * @returns {[IntersectionObserverEntry[], Function]} [entries, observe]
 */
const useViewportObserver = (
  elements,
  { threshold = 0, freezeOnEntry = false } = {}
) => {
  const [entries, setEntries] = useState([]);
  const observer = useRef();
  const [nextElements, setNextElements] = useState(elements);
  const isFirstMount = useFirstMountState();
  const isFrozen = !!entries.length && freezeOnEntry;
  const updateEntry = useCallback((entries) => setEntries(entries), []);
  const observe = useCallback((elems) => setNextElements(elems), []);

  useEffect(() => {
    if (!isFirstMount && elements?.length) {
      setNextElements((prevElements) =>
        prevElements.length !== elements.length ||
        !prevElements.every((prevEl) => elements.includes(prevEl))
          ? elements
          : prevElements
      );
    }
  }, [elements, isFirstMount]);

  useEffect(() => {
    const hasIOSupport = !!window.IntersectionObserver;
    const nodes = nextElements?.filter((element) => element) || [];

    if (!hasIOSupport || !nodes.length || isFrozen) return;

    const options = { threshold, root: null, rootMargin: '0%' };
    observer.current = new IntersectionObserver(updateEntry, options);

    nodes.forEach((node) => observer.current.observe(node));

    return () => observer.current.disconnect();
  }, [nextElements, JSON.stringify(threshold), isFrozen, updateEntry]); // eslint-disable-line react-hooks/exhaustive-deps

  return [entries, observe];
};

export default useViewportObserver;
