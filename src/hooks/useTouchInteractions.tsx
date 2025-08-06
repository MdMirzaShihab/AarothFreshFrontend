import React, { useCallback, useEffect, useRef, useState } from 'react';

// Touch interaction utilities and hooks for mobile-first design
export interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

export interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

export interface TouchInteractionConfig {
  // Swipe detection settings
  swipeThreshold: number;
  swipeVelocityThreshold: number;
  
  // Tap detection settings
  tapTimeout: number;
  tapThreshold: number;
  
  // Long press settings
  longPressDelay: number;
  longPressThreshold: number;
  
  // Touch feedback settings
  enableHapticFeedback: boolean;
  enableVisualFeedback: boolean;
}

const DEFAULT_CONFIG: TouchInteractionConfig = {
  swipeThreshold: 50,
  swipeVelocityThreshold: 0.3,
  tapTimeout: 300,
  tapThreshold: 10,
  longPressDelay: 500,
  longPressThreshold: 10,
  enableHapticFeedback: true,
  enableVisualFeedback: true,
};

// Hook for swipe gesture detection
export const useSwipeGesture = (
  onSwipe?: (gesture: SwipeGesture) => void,
  config: Partial<TouchInteractionConfig> = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const startPoint = useRef<TouchPoint | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (touch) {
      startPoint.current = {
        x: touch.clientX,
        y: touch.clientY,
        timestamp: Date.now(),
      };
    }
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!startPoint.current) return;

    const touch = e.changedTouches[0];
    if (!touch) return;

    const endPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    const deltaX = endPoint.x - startPoint.current.x;
    const deltaY = endPoint.y - startPoint.current.y;
    const duration = endPoint.timestamp - startPoint.current.timestamp;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const velocity = distance / duration;

    // Check if swipe meets threshold requirements
    if (distance >= mergedConfig.swipeThreshold && velocity >= mergedConfig.swipeVelocityThreshold) {
      let direction: SwipeGesture['direction'];
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        velocity,
        duration,
      };

      onSwipe?.(gesture);

      // Haptic feedback for supported devices
      if (mergedConfig.enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }

    startPoint.current = null;
  }, [onSwipe, mergedConfig]);

  const bindSwipeEvents = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchEnd]);

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchEnd]);

  return { bindSwipeEvents };
};

// Hook for enhanced tap interactions
export const useTouchTap = (
  onTap?: (event: TouchEvent) => void,
  onLongPress?: (event: TouchEvent) => void,
  config: Partial<TouchInteractionConfig> = {}
) => {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  const touchStartRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);
  const [isPressed, setIsPressed] = useState(false);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;

    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    setIsPressed(true);

    // Start long press timer
    longPressTimerRef.current = setTimeout(() => {
      if (touchStartRef.current && onLongPress) {
        onLongPress(e);
        
        // Haptic feedback for long press
        if (mergedConfig.enableHapticFeedback && 'vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    }, mergedConfig.longPressDelay);
  }, [onLongPress, mergedConfig]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = e.touches[0];
    if (!touch) return;

    const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
    const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

    // If finger moves too much, cancel tap and long press
    if (deltaX > mergedConfig.tapThreshold || deltaY > mergedConfig.tapThreshold) {
      clearLongPressTimer();
      setIsPressed(false);
      touchStartRef.current = null;
    }
  }, [mergedConfig.tapThreshold, clearLongPressTimer]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    clearLongPressTimer();
    setIsPressed(false);

    if (!touchStartRef.current) return;

    const duration = Date.now() - touchStartRef.current.timestamp;
    
    // Check if this is a valid tap (not a long press that already fired)
    if (duration < mergedConfig.longPressDelay && onTap) {
      onTap(e);
      
      // Haptic feedback for tap
      if (mergedConfig.enableHapticFeedback && 'vibrate' in navigator) {
        navigator.vibrate(25);
      }
    }

    touchStartRef.current = null;
  }, [onTap, mergedConfig.longPressDelay, clearLongPressTimer]);

  const bindTouchEvents = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: true });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      clearLongPressTimer();
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, clearLongPressTimer]);

  return { bindTouchEvents, isPressed };
};

// Hook for touch ripple effects
export const useTouchRipple = () => {
  const [ripples, setRipples] = useState<Array<{
    id: number;
    x: number;
    y: number;
    size: number;
  }>>([]);

  const addRipple = useCallback((event: React.TouchEvent | React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = ('touches' in event ? (event.touches[0]?.clientX ?? 0) : event.clientX) - rect.left - size / 2;
    const y = ('touches' in event ? (event.touches[0]?.clientY ?? 0) : event.clientY) - rect.top - size / 2;

    const newRipple = {
      id: Date.now(),
      x,
      y,
      size,
    };

    setRipples(prev => [...prev, newRipple]);

    // Remove ripple after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  }, []);

  const rippleElements = ripples.map(ripple => (
    <span
      key={ripple.id}
      className="absolute rounded-full bg-current opacity-30 animate-ripple pointer-events-none"
      style={{
        left: ripple.x,
        top: ripple.y,
        width: ripple.size,
        height: ripple.size,
        transform: 'scale(0)',
        animation: 'ripple 0.6s linear',
      }}
    />
  ));

  return { addRipple, rippleElements };
};

// Hook for pull-to-refresh
export const usePullToRefresh = (
  onRefresh: () => void | Promise<void>,
  threshold: number = 100
) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const startY = useRef<number | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const element = elementRef.current;
    if (!element) return;

    // Only start pull if at the top of the scroll container
    if (element.scrollTop === 0) {
      startY.current = e.touches[0]?.clientY ?? 0;
      setIsPulling(true);
    }
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isPulling || startY.current === null) return;

    const currentY = e.touches[0]?.clientY ?? 0;
    const distance = Math.max(0, currentY - startY.current);
    
    // Apply resistance curve for natural feel
    const resistance = Math.max(0, 1 - distance / (threshold * 2));
    const adjustedDistance = distance * resistance;
    
    setPullDistance(adjustedDistance);

    // Prevent default scrolling when pulling
    if (distance > 0) {
      e.preventDefault();
    }
  }, [isPulling, threshold]);

  const handleTouchEnd = useCallback(async () => {
    if (!isPulling) return;

    setIsPulling(false);
    
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      
      // Haptic feedback for refresh trigger
      if ('vibrate' in navigator) {
        navigator.vibrate(100);
      }

      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setPullDistance(0);
    startY.current = null;
  }, [isPulling, pullDistance, threshold, isRefreshing, onRefresh]);

  const bindPullToRefreshEvents = useCallback((element: HTMLElement | null) => {
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: true });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    bindPullToRefreshEvents,
    pullDistance,
    isRefreshing,
    isPulling,
    progress: Math.min(pullDistance / threshold, 1),
  };
};

// Utility function to check if device supports touch
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - legacy property
    navigator.msMaxTouchPoints > 0
  );
};

// Utility function to trigger haptic feedback
export const triggerHapticFeedback = (pattern?: number | number[]): void => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern || 50);
  }
};

// Utility function to ensure minimum touch target size
export const ensureMinTouchTarget = (size: number): string => {
  const minSize = 44; // 44px minimum as per accessibility guidelines
  return `${Math.max(size, minSize)}px`;
};