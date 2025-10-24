// Round counter display

interface RoundCounterProps {
  round: number;
}

export function RoundCounter({ round }: RoundCounterProps) {
  return (
    <div className="text-center" data-testid="round-counter">
      <p className="text-xl font-bold">Round {round}</p>
    </div>
  );
}
