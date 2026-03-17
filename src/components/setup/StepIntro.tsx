export default function StepIntro({ onNext }: any) {
  return (
    <div className="space-y-6">
      <h1 className="text-display-2">
        Let’s set up your profile
      </h1>

      <p className="text-muted-foreground">
        We’ll personalize your experience based on your body, style, and location.
      </p>

      <button
        onClick={onNext}
        className="w-full bg-primary text-white py-3 rounded-xl"
      >
        Start
      </button>
    </div>
  );
}