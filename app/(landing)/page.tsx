import ExercisesSection from "./exercises";
import HeroSection from "./hero";
import MultimediaFeaturesSection from "./multimedia-features";
import TemplatesSection from "./templates";

export default function Home() {
  return (
    <div className="flex flex-col gap-2">
      <HeroSection />
      <MultimediaFeaturesSection />
      <ExercisesSection />
      <TemplatesSection />
    </div>
  );
}
