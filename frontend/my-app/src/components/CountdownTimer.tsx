import { useEffect, useState } from 'react';

interface CountdownProps {
  endTime: number;
  onExpire?: () => void;
}

const CountdownTimer = ({ endTime, onExpire }: CountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000); // Current time in seconds
      const difference = endTime - now;

      if (difference <= 0) {
        setIsExpired(true);
        onExpire?.();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (60 * 60 * 24)),
        hours: Math.floor((difference % (60 * 60 * 24)) / (60 * 60)),
        minutes: Math.floor((difference % (60 * 60)) / 60),
        seconds: difference % 60,
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onExpire]);

  if (isExpired) {
    return <div className="text-red-500 font-semibold">Expired</div>;
  }

  return (
    <div className="text-sm font-medium">
      {timeLeft.days > 0 && `${timeLeft.days}d `}
      {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
    </div>
  );
};

export default CountdownTimer; 